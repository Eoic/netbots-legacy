import express from "express";
const router = express.Router();
import path from "path";

function getFile(filename: string) {
    return path.join(__dirname, "..", filename);
}

router.get("/robots.txt", (req, res) => {
    res.sendFile(getFile("robots.txt"));
});

router.get("/sitemap.xml", (req, res) => {
    res.sendFile(getFile("sitemap.xml"));
});

export { router as seo };
