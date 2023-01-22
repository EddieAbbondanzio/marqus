import { IpcPlugin } from "..";

// TODO: How will we tie this into the new logger?
export const logIpcPlugin: IpcPlugin = {
  "log.info": async ({ log }, message) => log.info(`[RENDERER] ${message}`),

  "log.debug": async ({ log }, message) => log.debug(`[RENDERER] ${message}`),

  "log.warn": async ({ log }, message) => log.warn(`[RENDERER] ${message}`),

  "log.error": async ({ log }, message, err) =>
    log.error(`[RENDERER] ${message}`, err),
};
