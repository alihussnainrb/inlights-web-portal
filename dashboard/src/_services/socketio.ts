import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export const socket = io("http://localhost:3001", {
  autoConnect: true,
  query: { id: "portal-socket-client" },
  withCredentials: true,
});

export const useSocketConnection = () => {
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setConnected(true);
    }

    function onDisconnect() {
      setConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return connected;
};
