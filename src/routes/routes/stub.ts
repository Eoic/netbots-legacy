import { Request, Response } from "express";

const stub = [{
  handler: async (req: Request, res: Response) => {
    res.json({ msg: "Pong." });
  },
  method: "get",
  path: "/stub",
}];

export { stub };
