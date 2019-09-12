import { routeVerifier } from './helpers/routeVerifier';
import { Request, Response } from 'express';
import { validationResult, body } from 'express-validator';
import { validatorMessages } from '../validation/validatorMessages';
import { validatorBounds } from '../validation/validatorBounds';
import { getConnection } from 'typeorm';
import { User } from '../models/User';
import bcryptjs from 'bcryptjs';
import { logger } from '../logger';

const login = [
  {
    path: '/login',
    method: 'get',
    handler: [
      routeVerifier.allowUnauthorizedOnly,
      async (req: Request, res: Response) => {
        res.render('login.njk');
      },
    ],
  },
  {
    path: '/login',
    method: 'post',
    validator: [
      body('username')
        .isAlphanumeric()
        .trim()
        .stripLow()
        .not()
        .isEmpty()
        .isLength(validatorBounds.USERNAME)
        .customSanitizer((username) => {
          return username.toLowerCase();
        }),
    ],
    handler: [
      routeVerifier.allowUnauthorizedOnly,
      async (req: Request, res: Response) => {
        const handleIncorrectLogin = () => {
          res.status(401).json({ errors: [validatorMessages.INCORRECT_LOGIN_DETAILS] });
        };

        if (validationResult(req)['errors'].length > 0) {
          handleIncorrectLogin();
          return;
        }

        const { username, password } = req.body;
        const user = await getConnection().manager.findOne(User, { username });

        if (user) {
          bcryptjs.compare(password, user.password, (err, result) => {
            if (err || !result) {
              handleIncorrectLogin();
              return;
            }

            if (req.session) {
              req.session!.userId = user.id;
              req.session.save((err) => {
                if (err) {
                  logger.error(err);
                } else {
                  res.redirect('/');
                }
              });
            }
          });
        } else {
          handleIncorrectLogin();
          return;
        }
      }],
  }];

export { login };
