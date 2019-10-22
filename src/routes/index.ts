import express from "express";
const router = express();

router.get("/", (req, res) => {
    res.render("index", {
        title: "NETBOTS - multiplayer robot programming game",
        // tslint:disable-next-line: object-literal-sort-keys
        metaDescription: {
            name: "NETBOTS | Multiplayer programming game",
            // tslint:disable-next-line: object-literal-sort-keys
            content: `Code behavior of your bots writing real JavaScript and compete
                      with other players`,
        },
        active: {
            index: true,
        },
    });
});

export { router as index };
