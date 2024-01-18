"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const api_1 = __importDefault(require("./api"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const socketio_1 = __importDefault(require("./services/socketio"));
const hostname = "localhost";
const port = 3000;
/* Server intitialization basic middlewares declaration */
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static("public"));
app.use((0, cors_1.default)({
    origin: "*",
    // origin: IS_DEV ? PORTAL_CLIENT_DEV_HOSTNAME : "",
    credentials: true,
}));
app.use(express_1.default.urlencoded({ extended: false }));
/* Initiate Socket.io server */
socketio_1.default.initialize(server);
/* Mount API Router */
app.use("/api", api_1.default);
app.get("/", (req, res) => {
    res.send("Hello World.");
});
server.listen(port, () => {
    console.log(`http://${hostname}:${port}`);
});
