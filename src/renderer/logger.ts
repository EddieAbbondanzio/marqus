import { getProcessType, isTest } from "../shared/env";
import { Logger } from "../shared/logger";

if (!isTest() && getProcessType() !== "renderer") {
  throw Error(
    "window.ipc is null. Did you accidentally import logger.ts in the main thread?",
  );
}

export const log: Logger = {
  info: async message => {
    // eslint-disable-next-line no-console
    console.log(message);
    window.ipc("log.info", message);
  },
  warn: async message => {
    // eslint-disable-next-line no-console
    console.warn(message);
    window.ipc("log.warn", message);
  },
  error: async (message, err) => {
    // eslint-disable-next-line no-console
    console.error(message);
    window.ipc("log.error", message);
    if (err) {
      window.ipc("log.error", err.message);

      if (err.stack) {
        window.ipc("log.error", err.stack);
      }
    }
  },
  debug: async message => {
    // eslint-disable-next-line no-console
    console.log(message);
    window.ipc("log.debug", message);
  },
};
