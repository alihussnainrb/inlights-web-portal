import json
import time
import serial
import socketio
import memcache

sio_client = socketio.Client()
mc1 = memcache.Client(['127.0.0.1:11211'], debug=0)

sio_client.connect(
    'https://5700-182-188-195-166.ngrok-free.app?id=iot-controller-socket-client',
    {"ngrok-skip-browser-warning": "true"}
)


def send_to_arduino(target_list_key, modified_list):
    modified_data = {
        "key": target_list_key,  # index 15 for hold state
        "list": modified_list  # list of values
    }
    # Convert the modified data to JSON format and send it back to Arduino
    ser.write(json.dumps(modified_data).encode() + b'\n')


@sio_client.on("hold-state")
def handle_hold_state(data: dict):
    print("Hold State Data")

    if (signals_data is None):
        return
    master_value = data.get("master")
    slave_value = data.get("slave")
    if master_value is None or slave_value is None:
        return
    # mc1.set("hold_master", master_value, time=10)
    # mc1.set("hold_slave", slave_value, time=10)
    send_to_arduino(10, [0, master_value, slave_value, 0])


@sio_client.on("mode-update")
def handle_update_mode(mode: str):
    print("Update Mode Data")
    first_value = 1 if (mode == "smart" or mode == "testing") else 0
    last_value = 1 if (mode == "testing" or mode == "blink") else 0
    send_to_arduino(10, [first_value, 0, 0, last_value])
    return {"status": "success"}


@sio_client.on("switch-phase")
def handle_switch_phase(data: dict):
    print("Update Mode Data")
    if (signals_data is None):
        return
    signal = data["signal"]
    phase_value = data["phase"]
    master_value = phase_value if signal == "master" else signals_data['current_green']['master']
    slave_value = phase_value if signal == "slave" else signals_data['current_green']['slave']
    send_to_arduino(6, [master_value, 0, slave_value, 0])


@sio_client.on("update-phase-time")
def handle_reset_phase_time(data):
    print("Reset Phase Time")
    print(data)
    if data["signal"] not in ["master", "slave"]:
        return
    time_value = data["value"]
    if data['signal'] == 'master':
        send_to_arduino(
            1,
            [
                time_value['0'],
                time_value['1'],
                time_value['2'],
                time_value['3']
            ]
        )
    elif data['signal'] == 'slave':
        send_to_arduino(
            12,
            [
                time_value['0'],
                time_value['1'],
                time_value['2'],
                time_value['3']
            ]
        )


@sio_client.on("reset-phase-time")
def handle_update_phase_time(data):
    print("Update Phase Time")
    print(data)
    if data["signal"] not in ["master", "slave"]:
        return
    if data['signal'] == 'master':
        send_to_arduino(1, [45, 30, 40, 40])
    elif data['signal'] == 'slave':
        send_to_arduino(12, [45, 30, 40, 40])


## Background thread to update the values every 0.5 seconds ##

def scheduler_process():
    '''Runs pending jobs every 0.5 seconds'''
    while True:
        '''Reads the data from the arduino and updates the values'''
        # reads the data from the arduino
        global value, ser, data, mc1, signals_data
        if ser.in_waiting > 0:
            try:
                ser.flush()
                time.sleep(0.05)
                # Read the line from the serial port and handle decoding errors
                line = ser.readline().decode('utf-8', errors='ignore').strip()
                # print("-----------------------------------------------------------")
                print(line)
                # Check if the received line is not empty
                if line and line != '':
                    # Parse the received JSON data as a list of lists
                    data = json.loads(line)

                    # Ensure the received data is a list of lists
                    if isinstance(data, list) and all(isinstance(item, list) for item in data):
                        # Process the received data
                        yellow_values = data[0]
                        green_values = data[1]  # [0,1,2,3] ->
                        order_values = data[2]
                        time_elapsed_values = data[3]
                        y_time_stamp_values = data[4]
                        time_stamp_values = data[5]
                        # current_green1 [master green, 0, slavegreen, 0]
                        current_green1_values = data[6]
                        transitions = data[7]  # [0,1,2,3] -> 0-> master
                        time_elapsed_red = data[8]
                        stamps_red = data[9]
                        # smart_mode [smart_state, master_hold, slave_hold, 0]
                        smart_mode = data[10]
                        yellow_values_slave = data[11]
                        green_values_slave = data[12]
                        order_values_slave = data[13]
                        time_elapsed_slave = data[14]
                        time_elapsed_red_slave = data[15]
                        # green_lights [master_yellow, master_green, slave_yellow, slave_green]
                        green_lights = data[16]

                        # mc1.set("red_elapsed", time_elapsed_red, time=10)
                        # mc1.set(
                        #     "green_elapsed", time_elapsed_values[current_green1_values[0]], time=10)
                        # if smart_mode[0] == 0:
                        #     mc1.set("current_green",
                        #             current_green1_values[0], time=10)
                        # elif smart_mode[0] == 1:
                        #     current_green1_values[0] = mc1.get("current_green")
                        #     current_green1_values[2] = mc1.get("current_green")
                        # mc1.set("transitions", transitions[0], time=10)
                        # mc1.set("hold_master", smart_mode[1], time=10)
                        # mc1.set("hold_slave", smart_mode[2], time=10)

                        # target_list_key = 6

                        # value_master = mc1.get("current_green")
                        # value_slave = mc1.get("hold_slave")
                        # if smart_mode[0] == 1:
                        #     # Modify the list as needed
                        #     modified_list = [0, value_master, value_slave, 0]
                        #     data[target_list_key] = modified_list
                        #     modified_data = {
                        #         "key": target_list_key,
                        #         "list": modified_list
                        #     }
                        #     # Convert the modified data to JSON format and send it back to Arduino
                        #     ser.write(json.dumps(
                        #         modified_data).encode() + b'\n')
                        #     print(
                        #         f"-------------Modified List {target_list_key}: {data[target_list_key]}")

                        # Update on the front end
                        # 4 seconds for the red light

                        cycle_time = (sum(yellow_values) * 2) + \
                            sum(green_values) + 4
                        print("Cycle Time:", cycle_time)

                        # Update the values in the database
                        # update_database(data)

                        controller_mode = 'manual'
                        if smart_mode[0] == 0 and smart_mode[3] == 1:
                            controller_mode = "blink"
                        elif smart_mode[0] == 1 and smart_mode[3] == 0:
                            controller_mode = "smart"
                        elif smart_mode[0] == 1 and smart_mode[3] == 1:
                            controller_mode = "testing"
                        else:
                            controller_mode = "manual"

                        signals_data = {
                            'yellow': {
                                'master': green_lights[0],
                                'slave': green_lights[2],
                            },
                            'green': {
                                'master': green_lights[1],
                                'slave': green_lights[3],
                            },
                            'transition': {
                                'master': transitions[0] == 1,
                                'slave': transitions[2] == 1,
                            },
                            'phase_time': {
                                'master': {
                                    0: green_values[0],
                                    1: green_values[1],
                                    2: green_values[2],
                                    3: green_values[3],
                                },
                                'slave': {
                                    0: green_values_slave[0],
                                    1: green_values_slave[1],
                                    2: green_values_slave[2],
                                    3: green_values_slave[3],
                                },

                            },
                            'cycle_time': {
                                'master': cycle_time,
                                'slave': cycle_time,
                            },
                            'elapsed_time': {
                                'master': {
                                    0: time_elapsed_values[0],
                                    1: time_elapsed_values[1],
                                    2: time_elapsed_values[2],
                                    3: time_elapsed_values[3],
                                },
                                'slave': {
                                    0: time_elapsed_slave[0],
                                    1: time_elapsed_slave[1],
                                    2: time_elapsed_slave[2],
                                    3: time_elapsed_slave[3],
                                },
                            },
                            'current_green': {
                                'master': current_green1_values[0],
                                'slave': current_green1_values[2]
                            },

                            'hold': {
                                'master': smart_mode[1] == 1,
                                'slave': smart_mode[2] == 1,
                            },
                            'mode': controller_mode
                        }
                        sio_client.emit("signals-data", signals_data)

                    else:
                        print("Invalid data format received.")
                        print()
                else:
                    print("Received an empty line.")
            except UnicodeDecodeError as e:
                print(f"Error decoding data: {e}")
            except json.JSONDecodeError:
                pass  # Do nothing if there is a JSON decoding error

        # time.sleep(2)


data = []
signals_data: dict | None = None

ser = serial.Serial('/dev/ttyACM0', 9600, timeout=1)
scheduler_process()
