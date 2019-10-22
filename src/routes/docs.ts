import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
    res.render("documentation", {
        title: "NETBOTS | Documentation",
        // tslint:disable-next-line: object-literal-sort-keys
        active: {
            documentation: true,
        },
    });
});

export { router as docs };
