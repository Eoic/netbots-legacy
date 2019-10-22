import winston, { format } from "winston";
const { timestamp, prettyPrint } = format;
import path from "path";

const logDir = `${__dirname}/logs`;
console.log(logDir);
const logger = winston.createLogger({
  defaultMeta: { service: "user-service" },
  format: winston.format.combine(
    winston.format.simple(),
    timestamp(),
    prettyPrint(),
  ),
  level: "info",
  transports: [
    new winston.transports.File({ filename: `${logDir}/error.log`, level: "error" }),
    new winston.transports.File({ filename: `${logDir}/info.log`, level: "info" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
    ),
  }));
}

export { logger };
