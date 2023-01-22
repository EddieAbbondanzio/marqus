import { IpcPlugin } from "..";
import { logger } from "../../logger";

// TODO: How will we tie this into the new logger?
export const logIpcPlugin: IpcPlugin = {
  "log.info": async (_, message) => void logger.info(`[RENDERER] ${message}`),

  "log.debug": async (_, message) => void logger.debug(`[RENDERER] ${message}`),

  "log.warn": async (_, message) => void logger.warn(`[RENDERER] ${message}`),

  "log.error": async (_, message, err) =>
    void logger.error(`[RENDERER] ${message}`, err),
};
