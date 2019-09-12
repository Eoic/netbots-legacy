import { index } from '../index';
import { login } from '../login';
import { register } from '../register';
import { stub } from '../stub';
import { logout } from '../logout';

const routes = [
  ...index,
  ...login,
  ...register,
  ...stub,
  ...logout,
];

export { routes };
