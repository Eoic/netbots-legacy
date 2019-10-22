import express from "express";
const router = express.Router();
import { User } from "../models/User";
import { privateRoute } from "./privateRoute";

router.get("/", privateRoute, (req, res) => {
    User.find().select({
        username: 1,
    }).where("username").ne((req as any).session.user.username)
      .where("multiplayerScript").ne(null).then((result) => {

        let errorMessage = null;

        if (typeof (req as any).session.user.error !== "undefined") {
            errorMessage = (req as any).session.user.error;
            (req as any).session.user.error = undefined;
        }

        res.render("lobby", {
            title: "Lobby",
            // tslint:disable-next-line: object-literal-sort-keys
            active: { multiplayer: true },
            users: result,
            error: errorMessage,
        });
    });
});

export { router as lobby };
