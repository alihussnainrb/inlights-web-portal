import { SingalDetailsView } from "./SignalDetailsView";
import { Navbar } from "./Navbar";
import { ISignalsData } from "@/_helpers/validation/signals-data";
import { useEffect } from "react";
import { useSignalsDataStore } from "@/_helpers/stores/useSignalsData";
import { socket } from "@/_services/socketio";

export function ManualView() {
  const { setSignalsData } = useSignalsDataStore();

  useEffect(() => {
    socket.on("signals-data", (data: ISignalsData, arg2) => {
      console.log("Socket Signals Data", data);
      setSignalsData(data);
      // if (arg2) {
      //   setConnectedToController(arg2.controllerConnected || false);
      // }
    });

    return () => {
      socket?.off("signals-data");
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="hero mx-auto">
      <Navbar />

      <div className="space-y-20">
        <SingalDetailsView signal="master" />
        <SingalDetailsView signal="slave" />
      </div>

      <footer>
        <h5>Developed By Inlights</h5>
      </footer>
    </div>
  );
}
