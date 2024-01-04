import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Socket, io } from "socket.io-client";

const SocketIOContext = createContext<{
  socket?: Socket;
  socketConnected?: boolean;
}>({});

export default function SocketIOProvider({
  children,
}: {
  children?: ReactNode;
}) {
  const [socket, setSocket] = useState<Socket>();
  const [connected, setConnected] = useState<boolean>(false);
  useEffect(() => {
    const sio = io("http://localhost:3001", {
      autoConnect: true,
      query: { id: "portal-socket-client" },
      withCredentials: true,
    });
    // sio.connect();
    setSocket(sio);

    return () => {
      sio.disconnect();
      setSocket(undefined);
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
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
  }, [socket]);

  return (
    <SocketIOContext.Provider
      value={{
        socket,
        socketConnected: connected,
      }}
    >
      {socket && children}
    </SocketIOContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSocket() {
  return useContext(SocketIOContext);
}
