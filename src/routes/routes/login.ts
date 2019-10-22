import bcryptjs from "bcryptjs";
import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { getConnection } from "typeorm";
import { logger } from "../../logger";
import { User } from "../../models/User";
import { validatorBounds } from "../../validation/validatorBounds";
import { validatorMessages } from "../../validation/validatorMessages";
import { routeVerifier } from "./helpers/routeVerifier";

const login = [
  {
    handler: [
      routeVerifier.allowUnauthorizedOnly,
      async (req: Request, res: Response) => {
        res.render("login.njk");
      },
    ],
    method: "get",
    path: "/login",
  },
  {
    handler: [
      routeVerifier.allowUnauthorizedOnly,
      async (req: Request, res: Response) => {
        const handleIncorrectLogin = () => {
          res.status(401).json({ errors: [validatorMessages.INCORRECT_LOGIN_DETAILS] });
        };

        // tslint:disable-next-line: no-string-literal
        if (validationResult(req)["errors"].length > 0) {
          handleIncorrectLogin();
          return;
        }

        const { username, password } = req.body;
        const user = await getConnection().manager.findOne((User as any), { username });

        if (user) {
          bcryptjs.compare(password, (user as any).password, (err, result) => {
            if (err || !result) {
              handleIncorrectLogin();
              return;
            }

            if (req.session) {
              req.session!.userId = (user as any).id;
              req.session.save((err) => {
                if (err) {
                  logger.error(err);
                } else {
                  res.redirect("/");
                }
              });
            }
          });
        } else {
          handleIncorrectLogin();
          return;
        }
      }],
    method: "post",
    path: "/login",
    validator: [
      body("username")
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
  }];

export { login };
