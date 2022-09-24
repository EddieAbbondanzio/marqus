import { Logger } from "../shared/logger";

export const logger: Logger = {
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
