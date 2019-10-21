import { index } from "../index";
import { login } from "../login";
import { logout } from "../logout";
import { register } from "../register";
import { stub } from "../stub";

const routes = [
  ...index,
  ...login,
  ...register,
  ...stub,
  ...logout,
];

export { routes };
