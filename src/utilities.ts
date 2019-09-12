import { Router } from "express";
import { Server as HttpServer } from "http";
import { Server as SocketServer } from "ws";
import { socketApi } from "./socket-api";
import { Route, Wrapper} from "./types";

export const useMiddleware = (middlewareWrappers: Wrapper[], router: Router) => {
  middlewareWrappers.forEach((wrapper) => {
    wrapper(router);
  });
};

export const useRoutes = (routes: Route[], router: Router) => {
  routes.forEach((route) => {
    const { method, path, handler, validator } = route;
    (router as any)[method](path, validator || [], handler);
  });
};

export const useSocketApi = (httpServer: HttpServer, socketServer: SocketServer) => {
  socketApi.use(httpServer, socketServer);
};
