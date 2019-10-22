import express from "express";
const router = express.Router();
import { privateRoute } from "./privateRoute";

router.get("/", privateRoute, (req, res) => {
    res.render("practice", {
        title: "Practice",
        // tslint:disable-next-line: object-literal-sort-keys
        active: {
            practice: true,
        },
    });
});

export { router as practice };
