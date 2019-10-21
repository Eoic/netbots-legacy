import { validatorBounds } from "./validatorBounds";

const validatorMessages = {
  USERNAME_LENGTH_INVALID: `Username should be between ${validatorBounds.USERNAME.min} and ${validatorBounds.USERNAME.max} characters long`,
  // tslint:disable-next-line: object-literal-sort-keys
  PASSWORD_LENGTH_INVALID: `Password should be between ${validatorBounds.PASSWORD.min} and ${validatorBounds.PASSWORD.max} characters long`,
  NOT_AN_EMAIL: "Entered email address is not valid",
  USERNAME_EMPTY: "Username is required",
  PASSWORD_EMPTY: "Password is required",
  EMAIL_EMPTY: "Email is required",
  INCORRECT_LOGIN_DETAILS: "Incorrect username or password",
  ALPHANUMERIC_ONLY: "Only alphanumeric chaacters are allowed",
  USERNAME_TAKEN: "This username is already taken",
  EMAIL_TAKEN: "This email is already taken",
};

export { validatorMessages };
