/* eslint-disable no-console */
import { format } from "date-fns";
import { Config } from "../shared/domain/config";
import { IpcMainTS } from "../shared/ipc";
import { Logger } from "../shared/logger";
import { JsonFile } from "./json";
import * as fsp from "fs/promises";
import * as fs from "fs";

// TODO: Add logging to file
// Have it manage files and delete anything older than 2 weeks

export function logIpcs(
  ipc: IpcMainTS,
  configFile: JsonFile<Config>,
  log: Logger
): void {
  ipc.handle("log.info", async (_, message) =>
    log.info(`[RENDERER] ${message}`)
  );

  ipc.handle("log.debug", async (_, message) =>
    log.debug(`[RENDERER] ${message}`)
  );

  ipc.handle("log.warn", async (_, message) =>
    log.warn(`[RENDERER] ${message}`)
  );

  ipc.handle("log.error", async (_, message) =>
    log.error(`[RENDERER] ${message}`)
  );
}

export async function getLogger(config: JsonFile<Config>): Promise<Logger> {
  const { logDirectory } = config.content;
  if (logDirectory != null && !fs.existsSync(logDirectory)) {
    await fsp.mkdir(logDirectory);
  }

  
  throw new Error("STOP");

  const log: Logger = {
    async debug(message: string): Promise<void> {
      const fullMessage = `${getTimeStamp()} (debug): ${message}`;
      console.log(fullMessage);
    },
    async info(message: string): Promise<void> {
      const fullMessage = `${getTimeStamp()} (info): ${message}`;
      console.log(fullMessage);
    },
    async warn(message: string): Promise<void> {
      const fullMessage = `${getTimeStamp()} (warn): ${message}`;
      console.warn(fullMessage);
    },
    async error(message: string): Promise<void> {
      const fullMessage = `${getTimeStamp()} (ERROR): ${message}`;
      console.error(fullMessage);
    },
  };

  // let fileStream = fs.createWriteStream();
}

export function getTimeStamp(): string {
  return format(new Date(), "L/d H:mm");
}
