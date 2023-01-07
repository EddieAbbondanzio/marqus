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
    await window.ipc("log.info", message);
  },
  warn: async message => {
    // eslint-disable-next-line no-console
    console.warn(message);
    await window.ipc("log.warn", message);
  },
  error: async (message, err) => {
    // eslint-disable-next-line no-console
    console.error(message);
    console.error(err);
    await window.ipc("log.error", message);

    // Easier to do this here, than in main because if we send the error over
    // IPC the stack will be stripped.
    if (err) {
      await window.ipc("log.error", err.message);

      if (err.stack) {
        await window.ipc("log.error", err.stack);
      }
    }
  },
  debug: async message => {
    // eslint-disable-next-line no-console
    console.log(message);
    await window.ipc("log.debug", message);
  },
};
