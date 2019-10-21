import express from "express";
const router = express.Router();
import { User } from "../models/User";

router.get("/", (request, response) => {
    User.find().select({
        "username": 1,
        // tslint:disable-next-line: object-literal-sort-keys
        "statistic.gamesWon": 1,
        "statistic.gamesPlayed": 1,
        "statistic.experience": 1,
    }).then((res: any) =>  {
        if (res === null) {
            response.redirect("/");
        } else {
            response.render("leaderboards", {
                title: "NETBOTS | Leaderboard",
                // tslint:disable-next-line: object-literal-sort-keys
                active: {
                    leaderboards: true,
                },
                users: modifyAndSort(res),
            });
        }
    });
});

/**
 * Sorts users by win rate
 * @param {Array} users All registered users
 */
function modifyAndSort(users: any) {
    const usersModified: any = [];

    users.forEach((item: any) => {
        let winRate = 0;

        if (item.statistic.gamesWon + item.statistic.gamesPlayed !== 0) {
            winRate =  Math.round((item.statistic.gamesWon / item.statistic.gamesPlayed) * 100);
        }

        usersModified.push({
            username: item.username,
            // tslint:disable-next-line: object-literal-sort-keys
            level: Math.floor(0.5 * Math.sqrt(item.statistic.experience)),
            gamesWon: item.statistic.gamesWon,
            gamesPlayed: item.statistic.gamesPlayed,
            winRate,
        });
    });

    usersModified.sort((left: any, right: any) => (left.winRate > right.winRate) ? -1 : 1);
    return usersModified;
}

export { router as leaderboards };
