import { PORTAL_CLIENT_DEV_HOSTNAME } from "@/helpers/constants";
import { IS_DEV } from "@/helpers/env";
import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import {
  IHoldStateData,
  IPhaseValuesObj,
  ISignalsData,
  holdStateDataSchema,
  phaseValuesObj,
  signalsDataSchema,
} from "@/validation/iot-controller";

var sioServer: SocketIOServer | null = null;

enum ALLOWED_SOCKET_CLIENT_ID {
  CONTROLLER_CLIENT = "iot-controller-socket-client",
  PORTAL_CLIENT = "portal-socket-client",
  AMBULANCE_CLIENT = "ambulance-socket-client",
}

const portalClientEmitter = {
  sendSignalsData: (data: ISignalsData) => {
    const dataSent = sioServer?.sockets
      .to(ALLOWED_SOCKET_CLIENT_ID.PORTAL_CLIENT)
      .emit("signals-data", data, { controllerConnected: true });
    console.log("Data Sent", dataSent);
  },
};

const controllerEmitter = {
  /* Send `hold state` event to controller */
  sendHoldStateEvent: (data: IHoldStateData) => {
    sioServer?.sockets
      .to(ALLOWED_SOCKET_CLIENT_ID.CONTROLLER_CLIENT)
      .emit("hold-state", data);
  },
  /* Send `update phase time` event to controller */
  sendUpdatePhaseTimeEvent: (data: IPhaseValuesObj) => {
    sioServer?.sockets
      .to(ALLOWED_SOCKET_CLIENT_ID.CONTROLLER_CLIENT)
      .emit("update-phase-time", data);
  },
  /* Send `reset phase time to default` event to controller */
  sendResetPhaseTimeEvent: () => {
    sioServer?.sockets
      .to(ALLOWED_SOCKET_CLIENT_ID.CONTROLLER_CLIENT)
      .emit("reset-phase-time");
  },
};

function handleSocketConnection(socket: Socket) {
  const clientId = socket.handshake.query.id as ALLOWED_SOCKET_CLIENT_ID;
  socket.join(clientId);
  console.log("socketio/connection", { clientId });

  /* Implement listeners for Iot Controller */
  if (clientId === ALLOWED_SOCKET_CLIENT_ID.CONTROLLER_CLIENT) {
    socket.on("signals-data", async (reqData) => {
      try {
        // console.log("signals-data", reqData);
        const data = await signalsDataSchema.parseAsync(reqData);
        console.log("socketio/signals-data: ", "Data Parsed");
        portalClientEmitter.sendSignalsData(data);
      } catch (error) {
        console.error("socketio/signals-data", error);
      }
    });
  }

  /* Implement listeners for Portal Client */
  if (clientId === ALLOWED_SOCKET_CLIENT_ID.PORTAL_CLIENT) {
    /* Listen for `hold-state` event */
    socket.on("hold-state", async (reqData, callback) => {
      try {
        const data = await holdStateDataSchema.parseAsync(reqData);
        console.log("socketio/hold-state", data);
        controllerEmitter.sendHoldStateEvent(data);
        callback({ status: "success" });
      } catch (error) {
        console.error("socketio/hold-state", error);
        callback({ status: "failed" });
      }
    });
    /* Listen for `update-phase-time` event */
    socket.on("update-phase-time", async (reqData, callback) => {
      try {
        const data = await phaseValuesObj.parseAsync(reqData);
        console.log("socketio/update-phase-time", data);
        controllerEmitter.sendUpdatePhaseTimeEvent(data);
        callback({ status: "success" });
      } catch (error) {
        console.error("socketio/update-phase-time", error);
        callback({ status: "failed" });
      }
    });
    /* Listen for `reset-phase-time` event */
    socket.on("reset-phase-time", async (callback) => {
      try {
        controllerEmitter.sendResetPhaseTimeEvent();
        callback({ status: "success" });
      } catch (error) {
        console.error("socketio/reset-phase-time", error);
        callback({ status: "failed" });
      }
    });
  }
}

function initialize(server: HTTPServer) {
  sioServer = new SocketIOServer(server, {
    cors: {
      origin: PORTAL_CLIENT_DEV_HOSTNAME,
      credentials: true,
    },
  });

  sioServer.use(async (socket, next) => {
    const clientId = socket.handshake.query.id;
    console.log("Client Id", clientId);
    if (
      typeof clientId === "string" &&
      Object.values(ALLOWED_SOCKET_CLIENT_ID).includes(clientId as any)
    ) {
      return next();
    }
    next(new Error("Unauthorized"));
  });

  sioServer.on("connection", handleSocketConnection);
}

const socketIO = {
  initialize,
  getInstance: () => sioServer,
};

export default socketIO;
