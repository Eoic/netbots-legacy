import { NextFunction, Request, Response } from "express";

export function privateRoute(req: Request, res: Response, next: NextFunction) {
    if (req.session !== undefined) {
        if (req.session.user && req.cookies[String(process.env.SESSION_NAME)]) {
            next();
        }
    } else {
        res.redirect("/");
    }
}
