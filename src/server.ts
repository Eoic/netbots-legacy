import { config } from "dotenv";
config();
import express from "express";
import "reflect-metadata";
import { loop, wsServerCallback } from "./game-api/core";
import { getSessionInstance } from "./middleware-instances";

import http from "http";
import ws from "ws";
import { /*connection, */ mongoConnect } from "./database";
import { logger } from "./logger";
import middleware from "./middleware";
import { useRoutes } from "./routes/routes";
import { useMiddleware, useTemplateEngine } from "./utilities";

// Create http and web socket servers
const port = process.env.PORT || 5000;
const router = express();
const httpServer = http.createServer(router);
const socketServer = new ws.Server({ noServer: true });

// Bootstrapping
mongoConnect.then(() => {
  logger.info("Connection to DB successful");
  useMiddleware(middleware, router);
  useTemplateEngine(router);
  useRoutes(router);
  // useSocketApi(httpServer, socketServer);
}).catch((err) => {
  logger.error(err);
});

// Start server
httpServer.listen(port, () => {
  logger.log("info", `Server is running on port ${port}.`);
});

// Start game web socket server and game loop
// Authorize upgrade
httpServer.on("upgrade", (request, socket, head) => {
  const response: any = new http.ServerResponse(request);
  getSessionInstance()(request, response, () => {
    if (!request.session.user) {
      logger.warn("Unauthorized upgrade.");
      return socket.destroy();
    }

    socketServer.handleUpgrade(request, socket, head, (ws) => {
      socketServer.emit("connection", ws, request);
    });
  });
});

// Handle web socket messages
socketServer.on("connection", (ws: any, req: any) => {
    wsServerCallback(ws, req);
});

loop();
