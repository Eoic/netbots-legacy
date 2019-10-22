import { Request, Response } from "express";
import { logger } from "../../logger";
import { routeVerifier } from "./helpers/routeVerifier";

const logout = [{
  handler: [
    routeVerifier.allowAuthorizedOnly,
    async (req: Request, res: Response) => {
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            logger.error(err);
          } else {
            res.clearCookie(process.env.SESSION_NAME || "sid");
          }
          res.redirect("/");
        });
      } else {
        res.sendStatus(401);
      }
    }],
  method: "get",
  path: "/logout",
}];

export { logout };
