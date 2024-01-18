import {
  ControllerMode,
  IPhaseValuesObj,
  ISignalsData,
} from "@/_helpers/validation/controller";
import { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useSignalsDataStore } from "@/_helpers/stores/useSignalsData";
import { toast } from "sonner";
import { socket } from "@/_services/socketio";
import { useSocketConnection } from "./hooks/useSocketCon";
import { Spinner } from "./ui/spinner";

type ISignal = "master" | "slave";

export function SingalDetailsView({ signal }: { signal: ISignal }) {
  const [phaseTimeValues, setPhaseTimeValues] = useState<IPhaseValuesObj | null>();
  const { signalsData, sendingEvent, setSendingEvent } = useSignalsDataStore();
  const { controllerConnected, socketConnected } = useSocketConnection();


  const sendToggleStateEvent = async () => {
    if (!signalsData) return;
    const masterHold = signalsData?.hold.master || false;
    const slaveHold = signalsData?.hold.slave || false;
    setSendingEvent({ event: "hold-state", value: true });

    try {
      const res = await socket.timeout(10000).emitWithAck("hold-state", {
        master: signal === "master" ? !masterHold : masterHold,
        slave: signal === "slave" ? !slaveHold : slaveHold,
      });
      if (res?.status !== "success") throw new Error("Failed on toggle state");
    } catch (error) {
      console.log(error);
      toast.error("Got some error while processing your request.", {
        action: {
          label: "Try Again",
          onClick: sendToggleStateEvent,
        },
      });
    } finally {
      setSendingEvent(null);
    }
  };
  const sendUpdatePhaseTimeEvent = async (reset = false) => {
    if (!reset && !phaseTimeValues) return;
    setSendingEvent({
      event: reset ? "reset-phase-time" : "update-phase-time",
      value: true,
    });

    try {
      let res: any = null;
      if (reset) {
        res = await socket?.timeout(10000)?.emitWithAck("reset-phase-time", { signal: signal });
      } else {
        res = await socket
          ?.timeout(10000)
          ?.emitWithAck("update-phase-time", {
            signal: signal,
            value: {
              ...signalsData?.phase_time?.[signal],
              ...phaseTimeValues
            }
          });
      }
      if (res?.status !== "success") {
        throw new Error("Failed on update phase time");
      }
      console.log(res);
      toast.success(
        reset
          ? "Phase time reset successfully"
          : "Phase time updated successfully"
      );
    } catch (error) {
      console.log(error);
      toast.error("Got some error while processing your request.", {
        action: {
          label: "Try Again",
          onClick: sendToggleStateEvent,
        },
      });
    } finally {
      setSendingEvent(null);
      window.location.reload()
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 items-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold uppercase">{signal}</h3>
          <p>
            transition :{" "}
            <span id="master-transition">
              {`${signalsData?.transition?.[signal] || false}`}
            </span>
          </p>
        </div>
        <div className="text-center">
          <p>
            Cycle Time : <span id="cycle-time">{signalsData?.cycle_time?.[signal]} sec</span>
          </p>
        </div>
      </div>
      <div className="space-y-3 mt-5">
        {signalsData && socketConnected && controllerConnected &&
          // {signalsData && socketConnected && controllerConnected &&
          [0, 1, 2, 3].map((phase) => (
            <SinglePhaseRow
              key={phase}
              phase={phase}
              phaseTimeInpValue={phaseTimeValues?.[phase]}
              onPhaseTimeChange={(time) => {
                setPhaseTimeValues({
                  ...phaseTimeValues,
                  [phase]: time,
                } as any);
              }}
              data={signalsData}
              signal={signal}
            />
          ))}
      </div>
      <div className="flex items-center justify-end gap-5 mt-10">
        <Button
          disabled={sendingEvent?.value || !signalsData}
          loading={sendingEvent?.value && sendingEvent.event === "hold-state"}
          onClick={sendToggleStateEvent}
          type="button"
          variant={"green-outline"}
        >
          {signalsData?.hold?.[signal] ? "Skip " : "Hold "} <span className="capitalize ml-1">{signal}</span>
        </Button>
        <Button
          disabled={sendingEvent?.value}
          loading={
            sendingEvent?.value && sendingEvent.event === "reset-phase-time"
          }
          type="button"
          className="py-[5px] px-5 w-auto"
          onClick={() => sendUpdatePhaseTimeEvent(true)}
        >
          Reset Phase Time
        </Button>
        <Button
          disabled={sendingEvent?.value || !phaseTimeValues}
          loading={
            sendingEvent?.value && sendingEvent.event === "update-phase-time"
          }
          type="button"
          onClick={() => sendUpdatePhaseTimeEvent()}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

type SinglePhaseRowProps = {
  phase: number;
  onPhaseTimeChange?: (time: number) => void;
  phaseTimeInpValue?: number;
  data: ISignalsData;
  signal: ISignal;
};

type ISignalState = "green" | "yellow" | "red";

function SinglePhaseRow({
  phase,
  onPhaseTimeChange,
  phaseTimeInpValue,
  data,
  signal,
}: SinglePhaseRowProps) {
  const [updatingPhase, setUpdatingPhase] = useState(false)

  let signalState: ISignalState = "red";
  if (data.green?.[signal] === phase) signalState = "green";
  if (data.yellow?.[signal] === phase) signalState = "yellow";



  const sendPhaseChangeEvent = async () => {
    setUpdatingPhase(true)
    try {
      const res = await socket.timeout(5000).emitWithAck("switch-phase", { signal, phase });
      if (res?.status !== "success") throw new Error("Failed on toggle state");
    } catch (error) {

    } finally {
      setUpdatingPhase(false)
    }
  }





  return (
    <div className="w-full grid grid-cols-12 items-center gap-5">
      <span className="col-span-1">{phase}.</span>
      <div className="flex items-center gap-5 col-span-5">
        <div
          className={cn("circle red-bg", signalState === "red" && "active")}
        />
        <div
          className={cn(
            "circle yellow-bg",
            signalState === "yellow" && "active"
          )}
        />
        <div
          className={cn("circle green-bg", signalState === "green" && "active")}
        />

        <div className="circle light-active bi-person-walking" />
      </div>

      <div className="col-span-3">
        <p>
          Countdown : <span>{data.elapsed_time[signal][phase]}</span> sec
        </p>
        {
          data.mode === ControllerMode.testing ?
            <h3></h3> :
            <h3>
              Set Green : <span>{data.phase_time[signal][phase]}</span> sec
            </h3>
        }
      </div>
      <div className="col-span-3 w-full">
        {
          data.mode === ControllerMode.testing ?
            <Button disabled={updatingPhase} onClick={sendPhaseChangeEvent} >
              {updatingPhase ? <Spinner /> : "Switch"}
            </Button>
            :
            <input
              type="number"
              className="w-full"
              placeholder="Between 10 and 100"
              value={phaseTimeInpValue}
              onChange={(e) => onPhaseTimeChange?.(e.target.valueAsNumber)}
            />
        }

      </div>
    </div>
  );
}
