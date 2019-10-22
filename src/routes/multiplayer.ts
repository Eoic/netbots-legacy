import express from "express";
const router = express.Router();
import uuidv4 from "uuid/v4";
import { GameSession } from "../models/GameSession";
import { User } from "../models/User";
import { privateRoute } from "./privateRoute";

/**
 * Select random oponnent and gets code for both players
 */
router.get("/start-game", privateRoute, (req, res) => {
    const userOne = (req as any).session.user.username;

    User.find({
        multiplayerScript: { $ne: null },
        username: { $ne: userOne },
    }).select({
        username: 1,
    }).then((users) => {
        if (users.length === 0) {
            res.status(202).json({ error: "No players available" });
        } else {
            const userTwo = selectRandomUser(users);

            User.find({
                username: {
                    $in: [
                        userOne,
                        userTwo,
                    ],
                },
            }).select({ multiplayerScript: 1, username: 1 })
                .then((users) => {

                    Promise.all([
                        User.findOne({
                            username: (users[0] as any).username,
                        }).select({
                            scripts: {
                                $elemMatch: {
                                    _id: (users[0] as any).multiplayerScript,
                                },
                            },
                            // tslint:disable-next-line: object-literal-sort-keys
                            _id: 0,
                            username: 1,
                        }),
                        User.findOne({
                            username: (users[1] as any).username,
                        }).select({
                            scripts: {
                                $elemMatch: {
                                    _id: (users[1] as any).multiplayerScript,
                                },
                            },
                            // tslint:disable-next-line: object-literal-sort-keys
                            _id: 0,
                            username: 1,
                        }),
                    ]).then(([userOne, userTwo]) => {
                        if ((userOne as any).scripts.length === 0) {
                            res.status(202).json({ error: "You have not created any scripts" });
                        } else {
                            if ((userTwo as any).scripts.length === 0) {
                                res.status(202).json({ error: "An error occured" });
                            } else {
                                createGameSession(req, res, userOne, userTwo, (req as any).session.user.username);
                            }
                        }
                    });
                });
        }
    });
});

router.get("/:id", privateRoute, (req, res, next) => {
    if ((req as any).session.user && req.cookies.connect_sid) {
        next();
    } else { res.redirect("/"); }
}, (req, res) => {
    if (typeof (req as any).session.user.multiplayer === "undefined") {
        return res.redirect("/");
    }

    GameSession.findOne({
        createdBy: (req as any).session.user.username,
        sessionId: (req as any).session.user.multiplayer.sessionId,
    }).then((user) => {
        if (!user) {
            res.redirect("/");
        } else {
            res.render("multiplayer", {
                title: "Multiplayer",
                // tslint:disable-next-line: object-literal-sort-keys
                active: {
                    multiplayer: true,
                },
            });
        }
    });
});

function selectRandomUser(userList: any) {
    return userList[Math.floor(Math.random() * userList.length)].username;
}

function removeOldSession(user: any) {
    return GameSession.findOneAndRemove({
        createdBy: user.username,
        sessionId: user.multiplayer.sessionId,
    });
}

function createNewSession(createdBy: any, sessionId: any, userOne: any, userTwo: any) {
    return GameSession.create({
        createdBy,
        sessionId,
    });
}

function createGameSession(req: any, res: any, userOne: any, userTwo: any, createdBy: any) {
    const sessionId = uuidv4();
    const newSessionPromise = createNewSession(createdBy, sessionId, userOne, userTwo);
    const deleteOldSessionPromise = (typeof req.session.user.multiplayer !== "undefined") ?
                                    removeOldSession(req.session.user) : Promise.resolve();

    Promise.all([deleteOldSessionPromise, newSessionPromise] as any).then(([oldSession, newSession]) => {
        GameSession.findOneAndUpdate({
            _id: (newSession as any)._id,
        }, {
                $push: {
                    data: {
                        $each: [{
                            code: userOne.scripts[0].code,
                            username: userOne.username,
                        }, {
                            code: userTwo.scripts[0].code,
                            username: userTwo.username,
                        }],
                    },
                },
            }).then(() => {
                req.session.user.multiplayer = { sessionId };
                res.json({ gameSessionId: sessionId });
            });
    }).catch((err: any) => {
        console.log(err);
    });
}

export { router as multiplayer };
