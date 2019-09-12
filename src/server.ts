import express from "express";
const app = express();
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import morgan from "morgan";
import path from "path";
/*
import uuidv4 from "uuid/v4";
const useRoutes = require("./routes/routes");
const config = require('../config');
const { connect } = require('./models/Index');
connect(process.env.MONGO_URI || config.mongoURI);
const port = process.env.PORT || config.devPort;
import WebSocket from 'ws';
*/
// const MemoryStore = require("memorystore")(session);
// const store = new MemoryStore();

// Game logic
// const { loop, wsServerCallback } = require("./game-api/core");

// Create handlebars engine instance

// Set handlebars view engine

/*
app.use(session({
    cookie: {
        maxAge: config.cookieAge || process.env.COOKIE_AGE,
    },
    genid: () => uuidv4(),
    resave: false,
    saveUninitialized: false,
    secret: config.sessionKey || process.env.SESSION_KEY,
    store,
}));
*/

/*
// Start game web socket server and game loop
const wsServer = new WebSocket.Server({ server });
wsServer.on("connection", (ws, req) => {
    wsServerCallback(ws, req, store)
});

loop();
*/

import { config } from "dotenv";
import "reflect-metadata";
config();

import http from "http";
import ws from "ws";
import { connection } from "./database";
import { logger } from "./logger";
import middleware from "./middleware";
import { routes } from "./routes/routes/helpers/routeDistributor";
import { useMiddleware, useRoutes, useSocketApi, useTemplateEngine } from "./utilities";

// Create http and web socket servers
const port = process.env.PORT || 5000;
const router = express();
const httpServer = http.createServer(router);
const socketServer = new ws.Server({ noServer: true });

// Bootstrapping
connection.then(() => {
  logger.info("Connection to DB successful");
  useMiddleware(middleware, router);
  useTemplateEngine(app);
  useRoutes(routes, router);
  useSocketApi(httpServer, socketServer);
}).catch((err) => {
  logger.error(err);
});

// Start server
httpServer.listen(port, () => {
  logger.log("info", `Server is running on port ${port}.`);
});
