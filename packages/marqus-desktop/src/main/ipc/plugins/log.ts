import { format, formatISO } from "date-fns";
import { Config } from "../../../shared/domain/config";
import { JsonFile } from "../../json";
import { IpcPlugin } from "..";
import winston, { Logger } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// TODO: How will we tie this into the new logger?
export const logIpcPlugin: IpcPlugin = {
  "log.info": async ({ log }, message) => log.info(`[RENDERER] ${message}`),

  "log.debug": async ({ log }, message) => log.debug(`[RENDERER] ${message}`),

  "log.warn": async ({ log }, message) => log.warn(`[RENDERER] ${message}`),

  "log.error": async ({ log }, message, err) =>
    log.error(`[RENDERER] ${message}`, err),
};

export async function getLogger(config: JsonFile<Config>): Promise<Logger> {
  const timestamp = winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" });
  const printf = winston.format.printf(
    info => `${info.timestamp} [${info.level}]: ${info.message}`,
  );

  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        timestamp,
        printf,
      ),
    }),
  ];

  const { logDirectory } = config.content;
  if (logDirectory != null) {
    console.log("ADDING FILE TRANSPORT!", logDirectory);
    transports.push(
      new DailyRotateFile({
        filename: `%DATE%.log`,
        dirname: logDirectory,
        datePattern: "YYYY-MM-DD",
        maxFiles: "14d",
        maxSize: "20m",
        format: winston.format.combine(timestamp, printf),
      }),
    );
  }

  const logger = winston.createLogger({
    level: "info",
    transports,
    // N.B. Format is specified at the transport layer because we want to support
    // colors in the console, but if we enable colors on the logger it'll print
    // out the control characters to the log file too.
  });

  return logger;
}
