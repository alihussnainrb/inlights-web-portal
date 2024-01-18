import express from "express";
import { createServer } from "http";
import apiRouter from "./api";
import corsMiddleware from "cors";
import cookieParser from "cookie-parser";
import socketIO from "./services/socketio";
import { IS_DEV } from "./helpers/env";
import { PORTAL_CLIENT_DEV_HOSTNAME } from "./helpers/constants";

const hostname = "localhost" as const;
const port = 3000 as const;

/* Server intitialization basic middlewares declaration */
const app = express();
const server = createServer(app);
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use(
  corsMiddleware({
    // origin: "*",
    origin: IS_DEV ? PORTAL_CLIENT_DEV_HOSTNAME : "",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: false }));

/* Initiate Socket.io server */
socketIO.initialize(server);

/* Mount API Router */
app.use("/api", apiRouter);

app.get("/", (req, res) => {
  res.send("Hello World.");
});

server.listen(port, () => {
  console.log(`http://${hostname}:${port}`);
});
