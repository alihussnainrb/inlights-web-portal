import { SingalDetailsView } from "./SignalDetailsView";
import { Navbar } from "./Navbar";
// import { ISignalsData } from "@/_helpers/validation/controller";
import { useEffect } from "react";
import { useSignalsDataStore } from "@/_helpers/stores/useSignalsData";
import { socket } from "@/_services/socketio";
import { ISignalsData } from "@/_helpers/validation/controller";

export function ManualView() {
  const { setSignalsData } = useSignalsDataStore();

  useEffect(() => {
    const handleSocketData = (data: ISignalsData) => {
      setSignalsData(data);
      // if (arg2) {
      //   setConnectedToController(arg2.controllerConnected || false);
      // }
    }
    socket.on("signals-data", handleSocketData);

    return () => {
      socket?.off("signals-data", handleSocketData);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="hero mx-auto">
      <Navbar />

      <div className="space-y-20">
        <SingalDetailsView signal="master" key={"master"} />
        <SingalDetailsView signal="slave" key={"slave"} />
      </div>

      <footer>
        <h5>Developed By Inlights</h5>
      </footer>
    </div>
  );
}
