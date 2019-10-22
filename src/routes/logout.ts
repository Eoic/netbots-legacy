import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
    res.clearCookie(String(process.env.SESSION_NAME));
    res.redirect("/");
});

export { router as logout };
