import { sitemap } from "express-sitemap";
import { docs } from "./docs";
import { index } from "./index";
import { leaderboards } from "./leaderboards";
import { lobby } from "./lobby";
import { login } from "./login";
import { logout } from "./logout";
import { multiplayer } from "./multiplayer";
import { practice } from "./practice";
import { profile } from "./profile";
import { register } from "./register";
import { scripts } from "./scripts";
import { seo } from "./seo";
import { users } from "./users";

// Sitemap generator
/*
sitemap({
    http: "https",
    route: {
        ALL: {
            lastmod: new Date(Date.now()).toLocaleDateString("LT"),
        },
    },
    url: "web-bots.herokuapp.com",
});
*/

export const useRoutes = (app: any) => {
    app.use((req: any, res: any, next: any) => {
        // Clear cookies if user is not set.
        if (req.cookies[String(process.env.SESSION_NAME)] && !req.session.user) {
            res.clearCookie(String(process.env.SESSION_NAME));
        }

        // Set locals if session exists.
        if (req.session.user && req.cookies[String(process.env.SESSION_NAME)]) {
            res.locals.authenticated = true;
            res.locals.user = {
                identiconHash: req.session.user.identiconHash,
                isAdmin: req.session.user.isAdmin,
                username: req.session.user.username,
            };
        }

        next();
    });

    app.use(index);
    app.use(seo);
    app.use("/login", login);
    app.use("/register", register);
    app.use("/documentation", docs);
    app.use("/logout", logout);
    app.use("/profile", profile);
    app.use("/practice", practice);
    app.use("/scripts", scripts);
    app.use("/multiplayer", multiplayer);
    app.use("/lobby", lobby);
    app.use("/leaderboards", leaderboards);
    app.use("/users", users);

    // Generate sitemap
    // sitemap.generate4(app, ["/login", "/register", "/documentation", "/leaderboards"]);
    // sitemap.XMLtoFile();
};
