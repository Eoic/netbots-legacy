import express from "express";
const router = express.Router();
import { privateRoute } from "./privateRoute";

router.get("/", privateRoute, (req, res, next) => {
    if ((req as any).session.user && req.cookies.connect_sid) {
        next();
    } else { res.redirect("/"); }
}, (req, res) => {
    res.render("practice", {
        title: "Practice",
        // tslint:disable-next-line: object-literal-sort-keys
        active: {
            practice: true,
        },
    });
});

export { router as practice };
