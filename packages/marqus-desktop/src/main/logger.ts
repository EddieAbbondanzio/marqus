import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { Config } from "../shared/domain/config";
import { JsonFile } from "./json";

const TIMESTAMP_FORMAT = winston.format.timestamp({
  format: "YYYY-MM-DD HH:mm:ss",
});
const PRINTF_FORMAT = winston.format.printf(
  info => `${info.timestamp} [${info.level}]: ${info.message}`,
);

export const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        TIMESTAMP_FORMAT,
        PRINTF_FORMAT,
      ),
    }),
  ],
  // N.B. Format is specified at the transport layer because we want to support
  // colors in the console, but if we enable colors on the logger it'll print
  // out the control characters to the log file too.
});

export function getFileTransport(config: JsonFile<Config>): winston.transport {
  const { logDirectory } = config.content;
  if (logDirectory == null) {
    throw new Error(`Log directory is required.`);
  }

  return new DailyRotateFile({
    filename: `%DATE%.log`,
    dirname: logDirectory,
    datePattern: "YYYY-MM-DD",
    maxFiles: "14d",
    maxSize: "20m",
    format: winston.format.combine(TIMESTAMP_FORMAT, PRINTF_FORMAT),
  });
}
