import { Request, Response } from 'express';

const index = [{
  path: '/',
  method: 'get',
  handler: async (req: Request, res: Response) => {
    res.render('index.njk', { title: 'Home' });
  },
}];

export { index };
