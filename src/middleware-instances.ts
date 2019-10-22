import connectRedis from "connect-redis";
import expressSession, { MemoryStore } from "express-session";
import redis from "redis";
import { SessionType } from "./types";

// Creates session store according to environment
const createStore = (sessionInstance: SessionType) => {
  /*
  if (process.env.NODE_ENV === "production") {
    const redisStore = connectRedis(sessionInstance);
    const redisClient = redis.createClient();
    return new redisStore({ client: redisClient });
  }
  */

  console.log("Creating development session store.");
  return new MemoryStore();
};

const session = expressSession({
  cookie: {
    maxAge: Number(process.env.COOKIE_AGE),
    sameSite: false,
    secure: (process.env.NODE_ENV === "production"),
  },
  name: process.env.SESSION_NAME,
  resave: false,
  saveUninitialized: false,
  secret: String(process.env.SESSION_SECRET),
  store: createStore(expressSession),
});

const getSessionInstance = () => session;
export { getSessionInstance };
