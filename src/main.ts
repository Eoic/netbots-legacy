import express, { Request, Response } from "express";
const app = express();

app.get("/", (req: Request, res: Response) => {
    res.json({ msg: "Index page." });
});

app.listen(process.env.PORT || 5000, () => {
    console.log("Test server is running...");
});
