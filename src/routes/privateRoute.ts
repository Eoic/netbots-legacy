import { NextFunction, Request, Response } from "express";

export function privateRoute(req: Request, res: Response, next: NextFunction) {
    if (req.session !== undefined) {
        if (req.session.user && req.cookies.session_id) {
            return next();
        }
    } else { res.redirect("/"); }
}
