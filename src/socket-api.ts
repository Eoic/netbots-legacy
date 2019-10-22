import http, { Server as HttpServer } from "http";
import redis from "redis";
import { Server as SocketServer } from "ws";
import { eventTypes } from "./event-types";
import { logger } from "./logger";
import { getSessionInstance } from "./middleware-instances";

// Dispatches created rooms to subscribers.
const roomPublisher = redis.createClient({
  url: "redis://h:p48991d57fba05b9748e09cd3869e57384be450bee6e77f64696bd64a655e9deb@ec2-52-214-198-105.eu-west-1.compute.amazonaws.com:32339",
});

const socketApi = {
  use: (httpServer: HttpServer, socketServer: SocketServer) => {
    // Upgrade connection
    httpServer.on(eventTypes.SERVER.UPG, (request, socket, head) => {
      const response: any = new http.ServerResponse(request);

      getSessionInstance()(request, response, () => {
        if (!request.session.userId) {
          logger.info("Unauthorized upgrade");
          return socket.destroy();
        }

        socketServer.handleUpgrade(request, socket, head, (ws) => {
          socketServer.emit(eventTypes.SERVER.CON, ws, request);
        });
      });
    });

    // On connection.
    socketServer.on(eventTypes.SERVER.CON, (client, request: any) => {
      logger.info("Web socket connection established.");
      client.emit(JSON.stringify({ msg: "Connection established" }));

      client.on(eventTypes.SERVER.MSG, (message: string) => {
        const messageObj = JSON.parse(message);

        if (messageObj.type) {
          const { type } = messageObj;

          switch (type) {
            case eventTypes.CLIENT.CREATE_GAME:
              console.log("Create game event received.");
              // const player = new Player(client);
              // roomPublisher.publish("ROOM_QUEUE", JSON.stringify(player));
              break;
            default:
              logger.info(`Message type unknown: ${type}`);
          }
        }
      });
    });
  },
};

export { socketApi };
