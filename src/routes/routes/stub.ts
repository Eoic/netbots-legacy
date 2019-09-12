import { Request, Response } from 'express';

const stub = [{
  path: '/stub',
  method: 'get',
  handler: async (req: Request, res: Response) => {
    res.json({ msg: 'Pong.' });
  },
}];

export { stub };
