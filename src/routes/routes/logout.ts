import { routeVerifier } from './helpers/routeVerifier';
import { Request, Response } from 'express';
import { logger } from '../logger';

const logout = [{
  method: 'get',
  path: '/logout',
  handler: [
    routeVerifier.allowAuthorizedOnly,
    async (req: Request, res: Response) => {
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            logger.error(err);
          } else {
            res.clearCookie(process.env.SESSION_NAME || 'sid');
          }
          res.redirect('/');
        });
      } else {
        res.sendStatus(401);
      }
    }],
}];

export { logout };
