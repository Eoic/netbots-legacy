import bcryptjs from "bcryptjs";
import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { getConnection } from "typeorm";
import { fillInstance } from "../../database/helpers";
import { logger } from "../../logger";
import { User } from "../../models/models/User";
import { validatorBounds } from "../../validation/validatorBounds";
import { validatorMessages } from "../../validation/validatorMessages";
import { routeVerifier } from "./helpers/routeVerifier";

const register = [
  {
    handler: [
      routeVerifier.allowUnauthorizedOnly,
      async (req: Request, res: Response) => {
        res.render("register.njk", { title: "Register" });
      },
    ],
    method: "get",
    path: "/register",
  },
  {
    validator: [
      body("username")
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
      body("email")
        .not()
        .isEmpty()
        .withMessage(validatorMessages.EMAIL_EMPTY)
        .isEmail()
        .withMessage(validatorMessages.NOT_AN_EMAIL)
        .normalizeEmail(),
      body("password")
        .isLength(validatorBounds.PASSWORD)
        .withMessage(validatorMessages.PASSWORD_LENGTH_INVALID),
    ],
    // tslint:disable-next-line: object-literal-sort-keys
    handler: [
      routeVerifier.allowUnauthorizedOnly,
      async (req: Request, res: Response) => {
        // tslint:disable-next-line: no-string-literal
        if (validationResult(req)["errors"].length > 0) {
          // tslint:disable-next-line: interface-name
          interface ErrorKeys { msg: string; param: string; }
          // tslint:disable-next-line: no-string-literal
          const errors = validationResult(req)["errors"].map((error: ErrorKeys) => ({
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
    method: "post",
    path: "/register",
  }];

export { register };
