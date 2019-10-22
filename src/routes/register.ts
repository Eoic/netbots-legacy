import express from "express";
const router = express.Router();
import { validationResult } from "express-validator";
import { User } from "../models/User";
import { validateRegistration } from "../utils/validator";

router.get("/", (req, res) => {
    res.render("register", {
        active: {
            register: true,
        },
        title: "Register",
    });
});

router.post("/", validateRegistration, (req: any, res: any) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render("register", {
            errors: errors.array(),
            form: {
                email: req.body.email,
                username: req.body.username,
            },
            title: "Register",
        });
    }

    const salt = "ef89esf288sefsef28sef8seg5sf5s5f9es9fs";
    const base64Hash = Buffer.from(req.body.username.trim().toLowerCase() + salt).toString("base64");

    const user = {
        email: req.body.email,
        identiconHash: base64Hash,
        password: req.body.password,
        username: req.body.username.trim().toLowerCase(),
    };

    User.create(user).then((newUser: any) => {
        (req as any).session.user = {
            _id: newUser._id,
            identiconHash: newUser.identiconHash,
            isAdmin: newUser.isAdmin,
            username: newUser.username,
        };

        return res.redirect("/profile");
    }).catch((err: any) => {
        res.status(422).json({ err });
    });
});

export { router as register };
