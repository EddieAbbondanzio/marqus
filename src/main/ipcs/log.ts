/* eslint-disable no-console */
import { differenceInCalendarDays, format, formatISO } from "date-fns";
import { Config } from "../../shared/domain/config";
import { IpcMainTS } from "../../shared/ipc";
import { Logger } from "../../shared/logger";
import { JsonFile } from "../json";
import * as fsp from "fs/promises";
import * as fs from "fs";
import * as p from "path";
import { ISO_8601_REGEX } from "../../shared/utils";
import chalk from "chalk";
import * as os from "os";

const DELETE_LOGS_OLDER_THAN_DAYS = 14;

export function logIpcs(
  ipc: IpcMainTS,
  configFile: JsonFile<Config>,
  log: Logger,
): void {
  ipc.handle("log.info", async (_, message) =>
    log.info(`[RENDERER] ${message}`),
  );

  ipc.handle("log.debug", async (_, message) =>
    log.debug(`[RENDERER] ${message}`),
  );

  ipc.handle("log.warn", async (_, message) =>
    log.warn(`[RENDERER] ${message}`),
  );

  ipc.handle("log.error", async (_, message, err) =>
    log.error(`[RENDERER] ${message}`, err),
  );
}

export async function getLogger(
  config: JsonFile<Config>,
  c: Console,
): Promise<Logger & { filePath: string; close: () => void }> {
  const { logDirectory } = config.content;
  if (logDirectory != null && !fs.existsSync(logDirectory)) {
    await fsp.mkdir(logDirectory);
  }

  // Delete any logs older than 2 weeks
  const entries = await fsp.readdir(logDirectory, { withFileTypes: true });
  for (const entry of entries) {
    if (p.extname(entry.name) !== "log" && !ISO_8601_REGEX.test(entry.name)) {
      continue;
    }

    const filePath = p.join(logDirectory, entry.name);
    const fileStats = await fsp.stat(filePath);

    if (
      differenceInCalendarDays(new Date(), fileStats.birthtime) >
      DELETE_LOGS_OLDER_THAN_DAYS
    ) {
      await fsp.unlink(filePath);
    }
  }

  const currLogFile = getLogFileName(new Date());
  const currFilePath = p.join(logDirectory, currLogFile);
  const fileStream = fs.createWriteStream(currFilePath, {
    flags: "a",
  });

  const log: Logger = {
    async debug(message: string): Promise<void> {
      const fullMessage = `${getTimeStamp()} (debug): ${message}`;
      c.log(chalk.cyan(fullMessage));

      await fileStream.write(fullMessage + os.EOL);
    },
    async info(message: string): Promise<void> {
      const fullMessage = `${getTimeStamp()} (info): ${message}`;
      c.log(fullMessage);

      fileStream.write(fullMessage + os.EOL);
    },
    async warn(message: string): Promise<void> {
      const fullMessage = `${getTimeStamp()} (warn): ${message}`;
      c.warn(chalk.yellow(fullMessage));

      fileStream.write(fullMessage + os.EOL);
    },
    async error(message: string): Promise<void> {
      const fullMessage = `${getTimeStamp()} (ERROR): ${message}`;

      c.error(chalk.red(fullMessage));
      fileStream.write(fullMessage + os.EOL);
    },
  };

  // Cannot be async, otherwise app stops running before empty log is deleted.
  const close = () => {
    fileStream.close();

    // Delete empty log files to avoid spamming file system.
    if (fs.statSync(currFilePath).size === 0) {
      fs.unlinkSync(currFilePath);
    }
  };

  return { ...log, filePath: currFilePath, close };
}

export function getTimeStamp(): string {
  return format(new Date(), "L/d H:mm");
}

export function getLogFileName(date: Date): string {
  return `${formatISO(date)}.log`;
}
