import { Request, Response } from 'express';
import { routeVerifier } from './helpers/routeVerifier';
import { validationResult, body } from 'express-validator';
import { validatorMessages } from '../validation/validatorMessages';
import { validatorBounds } from '../validation/validatorBounds';
import { getConnection } from 'typeorm';
import { User } from '../models/User';
import { fillInstance } from '../database/helpers';
import bcryptjs from 'bcryptjs';
import { logger } from '../logger';

const register = [
  {
    path: '/register',
    method: 'get',
    handler: [
      routeVerifier.allowUnauthorizedOnly,
      async (req: Request, res: Response) => {
        res.render('register.njk', { title: 'Register' });
      },
    ],
  },
  {
    path: '/register',
    method: 'post',
    validator: [
      body('username')
        .trim()
        .not()
        .isEmpty()
        .withMessage(validatorMessages.USERNAME_EMPTY)
        .isAlphanumeric()
        .withMessage(validatorMessages.ALPHANUMERIC_ONLY)
        .stripLow()
        .isLength(validatorBounds.USERNAME)
        .withMessage(validatorMessages.USERNAME_LENGTH_INVALID)
        .customSanitizer((username) => {
          return username.toLowerCase();
        }),
      body('email')
        .not()
        .isEmpty()
        .withMessage(validatorMessages.EMAIL_EMPTY)
        .isEmail()
        .withMessage(validatorMessages.NOT_AN_EMAIL)
        .normalizeEmail(),
      body('password')
        .isLength(validatorBounds.PASSWORD)
        .withMessage(validatorMessages.PASSWORD_LENGTH_INVALID),
    ],
    handler: [
      routeVerifier.allowUnauthorizedOnly,
      async (req: Request, res: Response) => {
        if (validationResult(req)['errors'].length > 0) {
          type ErrorKeys = { msg: string; param: string };
          const errors = validationResult(req)['errors'].map((error: ErrorKeys) => ({
            msg: error.msg,
            param: error.param,
          }));
          res.status(400).json({ errors });
          return;
        }

        const { email, username, password } = req.body;
        const errors = [];

        if (await getConnection().manager.findOne(User, { username })) {
          errors.push(validatorMessages.USERNAME_TAKEN);
        }

        if (await getConnection().manager.findOne(User, { email })) {
          errors.push(validatorMessages.EMAIL_TAKEN);
        }

        if (errors.length > 0) {
          res.status(400).json({ errors });
          return;
        }

        bcryptjs.genSalt(+!process.env.SALT_ROUNDS, (err, salt) => {
          if (err) {
            logger.error(err);
            res.sendStatus(500);
            return;
          }

          bcryptjs.hash(password, salt, (err, hash) => {
            if (err) {
              logger.error(err);
              res.sendStatus(500);
              return;
            }

            const user = fillInstance(new User(), { username, email, password: hash });
            getConnection().manager.save(user);
            res.sendStatus(200);
          });
        });
      },
    ],
  }];

export { register };
