import { Application, Router } from "express";
import expressHbs from "express-handlebars";
import { Server as HttpServer } from "http";
import { Server as SocketServer } from "ws";
import { socketApi } from "./socket-api";
import { Route, Wrapper } from "./types";

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

export const useTemplateEngine = (appInstance: Application) => {
  const hbs = expressHbs.create({
    defaultLayout: "layout",
    extname: ".hbs",
    helpers: {
      compareStrings: (left: string, right: string) => {
        if (left === right) {
          return "selected";
        }
      },
      ticksToSeconds(ticks: number) {
        const secondsTotal = Math.round(ticks / 30);
        const minutes = Math.floor(secondsTotal / 60);
        const seconds = secondsTotal % 60;
        return `${minutes} mins. and ${seconds} sec.`;
      },
      getPercent: (numerator: number, denominator: number) => {
        if (denominator !== 0 && numerator <= denominator) {
          return Math.round((numerator / denominator) * 100);
        }

        return 0;
      },
      getValueOrEmpty: (data: object) => (typeof data !== "undefined") ? data : "",
      increment: (value: number) => ++value,
      isArrayEmpty: (array: []) => (array.length === 0),
      isDefined: (value: object) => (typeof value !== "undefined") ? true : false,
      isNotZero: (value: number) => !(value === 0),
      isTrue: (value: boolean) => (value === true),
      toLocaleString: (dateString: string) => {
        // tslint:disable-next-line: max-line-length
        return new Date(dateString).toLocaleString("lt-LT", { day: "numeric", month: "2-digit", year: "numeric", hour: "numeric", minute: "numeric" });
      },
    },
    partialsDir: "views/partials",
  });

  appInstance.engine("hbs", hbs.engine as any);
  appInstance.set("view engine", "handlebars");
};
