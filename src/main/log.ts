import { format } from "date-fns";
import { Config } from "../shared/domain/config";
import { IpcMainTS } from "../shared/ipc";
import { JsonFile } from "./json";
import * as fs from "fs";

// TODO: Add logging to file
// Have it manage files and delete anything older than 2 weeks

export function logIpcs(ipc: IpcMainTS, config: JsonFile<Config>): void {
  // let fileStream;

  ipc.on("init", async () => {
    // fileStream = fs.createWriteStream();
  });

  ipc.handle("log.info", async (_, message) => {
    const fullMessage = `${getTimeStamp()} [RENDERER] (info): ${message}`;
    console.log(fullMessage);
  });

  ipc.handle("log.debug", async (_, message) => {
    const fullMessage = `${getTimeStamp()} [RENDERER] (debug): ${message}`;
    console.log(fullMessage);
  });

  ipc.handle("log.warn", async (_, message) => {
    const fullMessage = `${getTimeStamp()} [RENDERER] (warn): ${message}`;
    console.warn(fullMessage);
  });

  ipc.handle("log.error", async (_, message) => {
    const fullMessage = `${getTimeStamp()} [RENDERER] (ERROR): ${message}`;
    console.error(fullMessage);
  });
}

export function getTimeStamp() {
  return format(new Date(), "L/d H:mm");
}
