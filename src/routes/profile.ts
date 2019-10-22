import express from "express";
const router = express.Router();
import bcryptjs from "bcryptjs";
import { Achievement } from "../models/Achievement";
import { User } from "../models/User";
import { privateRoute } from "./privateRoute";
const SALT_ROUNDS = 10;

router.get("/", privateRoute, (req: any, res: any, next: any) => {
    User.findOne({
        username: req.session.user.username,
    }).select({
        "achievements": 1,
        "multiplayerScript": 1,
        "scripts._id": 1,
        "scripts.name": 1,
        "statistic.experience": 1,
        "statistic.gameTime": 1,
        "statistic.gamesPlayed": 1,
        "statistic.gamesWon": 1,
    }).lean().then((user) => {
        if (!user) {
            return res.sendStatus(404);
        }

        getUnlockedAchievements(user, (unlockedAchievements: any) => {
            res.render("profile", {
                title: "Profile",
                // tslint:disable-next-line: object-literal-sort-keys
                achievementsBriefList: true,
                identicons: true,
                active: { profile: true },
                scripts: user.scripts,
                selectedScript: (typeof user.multiplayerScript !== "undefined" && user.multiplayerScript !== null) ? user.multiplayerScript._id : 0,
                level: Math.floor(0.5 * Math.sqrt(user.statistic.experience)),
                experience: user.statistic.experience,
                experienceNext: Math.pow(2 * (Math.floor(0.5 * Math.sqrt(user.statistic.experience)) + 1), 2),
                gamesWon: user.statistic.gamesWon,
                gamesLost: user.statistic.gamesPlayed - user.statistic.gamesWon,
                gamesPlayed: user.statistic.gamesPlayed,
                gameTime: user.statistic.gameTime,
                unlockedAchievements,
            });
        });
    }).catch((err) => {
        res.status(500).send(err.message);
    });
});

router.get("/achievements", privateRoute, (req, res, next) => {
    if ((req as any).session.user && req.cookies.connect_sid) {
        next();
    } else { res.redirect("/"); }
}, (req, res) => {
    User.findOne({
        username: (req as any).session.user.username,
    }).select({
        "multiplayerScript": 1,
        "scripts._id": 1,
        "scripts.name": 1,
        "statistic.experience": 1,
    }).lean().then((user) => {
        if (!user) {
            return res.sendStatus(404);
        }

        Achievement.find().then((achievements) => {
            res.render("profile", {
                achievements,
                achievementsBriefList: false,
                active: { profile: true },
                experience: user.statistic.experience,
                experienceNext: Math.pow(2 * (Math.floor(0.5 * Math.sqrt(user.statistic.experience)) + 1), 2),
                identicons: true,
                level: Math.floor(0.5 * Math.sqrt(user.statistic.experience)),
                scripts: user.scripts,
                selectedScript: (typeof user.multiplayerScript !== "undefined" && user.multiplayerScript !== null) ? user.multiplayerScript._id : 0,
                title: "Profile",
            });
        }).catch((err) => {
            res.status(500).send(err.message);
        });
    }).catch((err) => {
        res.status(500).send(err.message);
    });
});

router.get("/edit-account", privateRoute, (req, res) => {

    const error = (typeof req.query.error !== "undefined") ? req.query.error : undefined;
    const success = (typeof req.query.success !== "undefined") ? req.query.success : undefined;

    User.findOne({
        username: (req as any).session.user.username,
    }).select({
        "email": 1,
        "multiplayerScript": 1,
        "scripts._id": 1,
        "scripts.name": 1,
        "statistic.experience": 1,
        "username": 1,
    }).lean().then((user) => {
        if (!user) {
            return res.sendStatus(404);
        }

        res.render("profile", {
            active: { profile: true },
            editAccount: true,
            email: user.email,
            error,
            experience: user.statistic.experience,
            experienceNext: Math.pow(2 * (Math.floor(0.5 * Math.sqrt(user.statistic.experience)) + 1), 2),
            identicons: true,
            level: Math.floor(0.5 * Math.sqrt(user.statistic.experience)),
            scripts: user.scripts,
            selectedScript: (typeof user.multiplayerScript !== "undefined" && user.multiplayerScript !== null) ? user.multiplayerScript._id : 0,
            success,
            title: "Profile",
            username: user.username,
        });
    }).catch((err) => {
        res.status(500).send(err.message);
    });
});

router.post("/edit-account", privateRoute, (req, res) => {
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    const repeatNewPassword = req.body.repeatNewPassword;

    if (newPassword.length < 6) {
        sendErrorMessage(res, "New password must be at least 6 characters long");
        return;
    } else if (newPassword !== repeatNewPassword) {
        sendErrorMessage(res, "New passwords doesn't match");
        return;
    }

    User.findOne({
        _id: (req as any).session.user._id,
    }).then((user) => {
        if (!user) {
            res.sendStatus(304);
        } else {
            (user as any).comparePasswords(currentPassword, (err: any, success: any) => {
                if (!success) {
                    sendErrorMessage(res, "Entered current password is incorrect");
                } else {
                    bcryptjs.hash(newPassword, SALT_ROUNDS).then((hash) => {
                        User.findOneAndUpdate({ _id: user._id }, {
                            password: hash,
                        }).then((user) => {
                            sendSuccessMessage(res, "Password changed successfully");
                        }).catch(() => {
                            sendErrorMessage(res, "Failed to change password");
                        });
                    });
                }
            });
        }
    });

});

function getUnlockedAchievements(user: any, callback: any) {
    const keys: any = [];

    if (user.achievements !== undefined) {
        user.achievements.forEach((item: any) => {
            keys.push(item.key);
        });
    }

    Achievement.find({
        key: { $in: keys },
    }).select({
        _id: 0,
        description: 1,
        iconName: 1,
        key: 1,
        title: 1,
    }).then((achievements) => {
        achievements.sort(compareByKey);
        user.achievements.sort(compareByKey);

        user.achievements.forEach((achievement: any, index: any) => {
            (achievements[index] as any).unlockedAt = achievement.unlockedAt;
        });

        callback((achievements !== undefined) ? achievements : []);
    });
}

function compareByKey(left: any, right: any) {
    if (left.key < right.key) {
        return -1;
    } else if (left.key > right.key) {
        return 1;
 }

    return 0;
}

function sendErrorMessage(res: any, message: any) {
    const encodedString = encodeURIComponent(message);
    res.redirect(`/profile/edit-account/?error=${encodedString}`);
}

function sendSuccessMessage(res: any, message: any) {
    const encodedString = encodeURIComponent(message);
    res.redirect(`/profile/edit-account/?success=${encodedString}`);
}

export { router as profile };
