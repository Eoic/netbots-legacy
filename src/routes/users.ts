import express from "express";
const router = express.Router();
import crypto from "crypto";
import { User } from "../models/User";
const RANDOM_BYTES = 24;
const SALT_ROUNDS = 10;
import bcryptjs from "bcryptjs";
import { getPasswordResetEmail, sendMail } from "../utils/mailer";
// tslint:disable-next-line: no-var-requires
const passwordResetLifespan = 1000000; // require("../config").passwordResetLifespan;
import { privateRoute } from "./privateRoute";

// Get all registered users
router.get("/manage-users", privateRoute, (req, res) => {
    if (!(req as any).session.user.isAdmin) {
        res.redirect("/");
    } else {
        User.find({}, "username email createdAt updatedAt isAdmin").then((result) => {
            res.render("manageUsers", {
                title: "Manage users",
                users: result,
                // tslint:disable-next-line: object-literal-sort-keys
                active: {
                    users: true,
                },
            });
        });
    }
});

// Delete user
router.delete("/manage-users/:id", privateRoute, (req, res, next) => {
    if ((req as any).session.user && req.cookies.connect_sid) {
        next();
    } else {
        res.redirect("/");
    }
}, (req, res) => {
    if (!(req as any).session.user.isAdmin) {
        res.redirect("/");
    } else {
        if (typeof req.params.id !== "undefined") {
            User.deleteOne({
                _id: req.params.id,
            }).then(() => {
                res.sendStatus(200);
            }).catch((err) => {
                res.sendStatus(500);
            });
        }
    }
});

router.get("/restore-password", (req, res) => {
    res.render("restorePassword", {
        title: "Reset password",
    });
});

router.post("/reset-password", (req, res) => {

    crypto.randomBytes(RANDOM_BYTES, ((err, buffer) => {
        const hash = buffer.toString("hex");
        const expiresAt = Date.now() + passwordResetLifespan;

        User.findOne({
            email: req.body.email,
        }).then((user) => {
            if (!user) {
                res.render("restorePassword", {
                    errors: ["Couldn't find user with this email."],
                });
            } else {
                User.findOneAndUpdate({
                    email: req.body.email,
                }, {
                        resetPasswordToken: hash,
                        resetPasswordTokenExpires: expiresAt,
                    },
                ).then(() => {

                    // Send email with token
                    const messageBody = getPasswordResetEmail(req.body.email, `${req.protocol}://${req.get("host")}/users/change-password/${hash}`);
                    sendMail(messageBody);

                    res.render("success", {
                        message: "Password reset request successful. Please check your email.",
                        title: "Password reset",
                    });
                });
            }
        });
    }));
});

router.get("/change-password/:id", (req, res) => {
    User.findOne({
        resetPasswordToken: req.params.id,
    }).then((user) => {
        if (!user) {
            res.redirect("/");
        } else {
            res.render("changePassword", {
                errors: (typeof req.query.errors !== "undefined") ? [req.query.errors] : [],
                title: "Set new password",
                token: req.params.id,
            });
        }
    });
});

// Todo: add password validation
router.post("/change-password/:id", (req, res) => {
    if (req.body.password === req.body.newPassword) {
        bcryptjs.hash(req.body.password, SALT_ROUNDS).then((hash) => {
            User.findOne({
                resetPasswordToken: req.params.id,
            }, "resetPasswordTokenExpires").then((user) => {
                if (user) {

                    const currentDate = Date.now();
                    const tokenDate = new Date((user as any).resetPasswordTokenExpires).getTime();

                    // If password reset token is still not expired
                    if (tokenDate > currentDate) {
                        User.updateOne({
                            resetPasswordToken: req.params.id,
                        }, {
                                password: hash,
                            }).then(() => {
                                // Remove token after successful password reset
                                User.updateOne({
                                    resetPasswordToken: req.params.id,
                                }, {
                                        resetPasswordToken: null,
                                        resetPasswordTokenExpires: null,
                                    }).then(() => {
                                        res.render("success", {
                                            message: `Password change successful. You may login now.`,
                                            title: "Password change",
                                        });
                                    });
                            });
                    } else {
                        res.render("error", {
                            message: "Password reset token expired",
                            title: "Cannot reset password",
                        });
                    }
                }
            });
        }).catch((err) => {
            console.log(err);
        });
    } else {
        // If passwords doesnt match, pass errors and re-render page
        const encodedString = encodeURIComponent("Passwords doesn't match");
        res.redirect(`/users/change-password/${req.params.id}/?errors=${encodedString}`);
    }
});

export { router as users };
