import { createConnection } from "typeorm";
import { Script } from "./models/models/Script";
import { Statistics } from "./models/models/Statistics";
import { User } from "./models/models/User";

export const connection = createConnection({
  database: process.env.DB_NAME,
  entities: [User, Script, Statistics],
  host: process.env.DB_HOST,
  password: process.env.DB_PASS,
  port: +!process.env.DB_PORT || 3306,
  synchronize: true,
  type: "mysql",
  username: process.env.DB_USER,
});
