import { Request, Response } from "express";

const index = [{
  handler: async (req: Request, res: Response) => {
    res.render("index.njk", { title: "Home" });
  },
  method: "get",
  path: "/",
}];

export { index };
