import { socket } from "@/_services/socketio";
import React, { useContext, useEffect, useState } from "react";


type SocketConnectionData = {
  socketConnected?: boolean;
  controllerConnected?: boolean;
}

const SocketConnectionContext = React.createContext<SocketConnectionData>({ socketConnected: false, controllerConnected: false });

type SocketConnectionProviderProps = {
  children?: React.ReactNode
}


var timeoutQueue: number | null = null;


export default function SocketConnectionProvider({ children }: SocketConnectionProviderProps) {
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [controllerConnected, setControllerConnected] = useState<boolean>(false);


  useEffect(() => {

    function onConnect() {
      setSocketConnected(true);
    }

    function onDisconnect() {
      setSocketConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);


    const handleOnSignalsData = () => {
      setControllerConnected(true);
      if (timeoutQueue) {
        clearTimeout(timeoutQueue);
        timeoutQueue = null;
      }
      const id = setTimeout(() => setControllerConnected(false), 5000);
      timeoutQueue = id;
    };
    socket.on("signals-data", handleOnSignalsData);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("signals-data", handleOnSignalsData);
      if (timeoutQueue) {
        clearTimeout(timeoutQueue);
        timeoutQueue = null;
      }
    };

  }, []);


  return (
    <SocketConnectionContext.Provider value={{ controllerConnected, socketConnected }}>
      {children}
    </SocketConnectionContext.Provider>
  )
}




// eslint-disable-next-line react-refresh/only-export-components
export function useSocketConnection() {
  return useContext(SocketConnectionContext);
}
