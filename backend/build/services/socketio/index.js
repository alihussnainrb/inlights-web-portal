"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../helpers/constants");
const socket_io_1 = require("socket.io");
const iot_controller_1 = require("../../validation/iot-controller");
var sioServer = null;
var ALLOWED_SOCKET_CLIENT_ID;
(function (ALLOWED_SOCKET_CLIENT_ID) {
    ALLOWED_SOCKET_CLIENT_ID["CONTROLLER_CLIENT"] = "iot-controller-socket-client";
    ALLOWED_SOCKET_CLIENT_ID["PORTAL_CLIENT"] = "portal-socket-client";
    ALLOWED_SOCKET_CLIENT_ID["AMBULANCE_CLIENT"] = "ambulance-socket-client";
})(ALLOWED_SOCKET_CLIENT_ID || (ALLOWED_SOCKET_CLIENT_ID = {}));
const portalClientEmitter = {
    sendSignalsData: (data) => {
        const dataSent = sioServer === null || sioServer === void 0 ? void 0 : sioServer.sockets.to(ALLOWED_SOCKET_CLIENT_ID.PORTAL_CLIENT).emit("signals-data", data, { controllerConnected: true });
        console.log("Data Sent", dataSent);
    },
};
const controllerEmitter = {
    /* Send `hold state` event to controller */
    sendHoldStateEvent: (data) => {
        sioServer === null || sioServer === void 0 ? void 0 : sioServer.sockets.to(ALLOWED_SOCKET_CLIENT_ID.CONTROLLER_CLIENT).emit("hold-state", {
            master: data.master === true ? 1 : 0,
            slave: data.slave === true ? 1 : 0,
        });
    },
    /* Send `update phase time` event to controller */
    sendUpdatePhaseTimeEvent: (data) => {
        sioServer === null || sioServer === void 0 ? void 0 : sioServer.sockets.to(ALLOWED_SOCKET_CLIENT_ID.CONTROLLER_CLIENT).emit("update-phase-time", data);
    },
    /* Send `reset phase time to default` event to controller */
    sendResetPhaseTimeEvent: (data) => {
        sioServer === null || sioServer === void 0 ? void 0 : sioServer.sockets.to(ALLOWED_SOCKET_CLIENT_ID.CONTROLLER_CLIENT).emit("reset-phase-time", data);
    },
    sendControllerModeUpdateEvent: (mode) => {
        console.log("mode", mode);
        sioServer === null || sioServer === void 0 ? void 0 : sioServer.sockets.to(ALLOWED_SOCKET_CLIENT_ID.CONTROLLER_CLIENT).emit("mode-update", mode);
    },
};
function handleSocketConnection(socket) {
    const clientId = socket.handshake.query.id;
    socket.join(clientId);
    console.log("socketio/connection", { clientId });
    /* Implement listeners for Iot Controller */
    if (clientId === ALLOWED_SOCKET_CLIENT_ID.CONTROLLER_CLIENT) {
        socket.on("signals-data", async (reqData) => {
            try {
                console.log("signals-data", reqData);
                const data = await iot_controller_1.signalsDataSchema.parseAsync(reqData);
                console.log("socketio/signals-data: ", "Data Parsed");
                portalClientEmitter.sendSignalsData(data);
            }
            catch (error) {
                console.error("socketio/signals-data", error);
            }
        });
    }
    /* Implement listeners for Portal Client */
    if (clientId === ALLOWED_SOCKET_CLIENT_ID.PORTAL_CLIENT) {
        /* Listen for `hold-state` event */
        socket.on("hold-state", async (reqData, callback) => {
            try {
                const data = await iot_controller_1.holdStateDataSchema.parseAsync(reqData);
                console.log("socketio/hold-state", data);
                controllerEmitter.sendHoldStateEvent(data);
                callback({ status: "success" });
            }
            catch (error) {
                console.error("socketio/hold-state", error);
                callback({ status: "failed" });
            }
        });
        socket.on("mode-update", async (mode) => {
            try {
                console.log("socketio/mode-update", mode);
                controllerEmitter.sendControllerModeUpdateEvent(mode);
            }
            catch (error) { }
        });
        /* Listen for `update-phase-time` event */
        socket.on("update-phase-time", async (reqData, callback) => {
            try {
                // const data = await phaseValuesObj.parseAsync(reqData);
                // console.log("socketio/update-phase-time", data);
                controllerEmitter.sendUpdatePhaseTimeEvent(reqData);
                callback({ status: "success" });
            }
            catch (error) {
                console.error("socketio/update-phase-time", error);
                callback({ status: "failed" });
            }
        });
        /* Listen for `reset-phase-time` event */
        socket.on("reset-phase-time", async (data, callback) => {
            try {
                controllerEmitter.sendResetPhaseTimeEvent(data);
                callback({ status: "success" });
            }
            catch (error) {
                console.error("socketio/reset-phase-time", error);
                callback({ status: "failed" });
            }
        });
    }
}
function initialize(server) {
    sioServer = new socket_io_1.Server(server, {
        cors: {
            origin: constants_1.PORTAL_CLIENT_DEV_HOSTNAME,
            credentials: true,
        },
    });
    sioServer.use(async (socket, next) => {
        const clientId = socket.handshake.query.id;
        console.log("Client Id", clientId);
        if (typeof clientId === "string" &&
            Object.values(ALLOWED_SOCKET_CLIENT_ID).includes(clientId)) {
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
exports.default = socketIO;
