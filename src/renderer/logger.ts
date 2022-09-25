import { getProcessType, isTest } from "../shared/env";
import { Logger } from "../shared/logger";

if (!isTest() && getProcessType() !== "renderer") {
  throw Error(
    "window.ipc is null. Did you accidentally import logger.ts in the main thread?"
  );
}

export const log: Logger = {
  info: async (message) => {
    console.log(message);
    window.ipc("log.info", message);
  },
  warn: async (message) => {
    console.warn(message);
    window.ipc("log.warn", message);
  },
  error: async (message) => {
    console.error(message);
    window.ipc("log.error", message);
  },
  debug: async (message) => {
    console.log(message);
    window.ipc("log.debug", message);
  },
};
