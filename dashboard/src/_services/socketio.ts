import { io } from "socket.io-client";

export const socket = io(import.meta.env.DEV ? "http://localhost:3000" : "", {
  autoConnect: true,
  query: { id: "portal-socket-client" },
  withCredentials: true,
});
