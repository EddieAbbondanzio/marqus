import { app } from "electron";
import { z } from "zod";
import { DEFAULT_WINDOW_HEIGHT, DEFAULT_WINDOW_WIDTH } from "../..";
import { ConfigV1 } from "./1_initialDefinition";

export interface ConfigV2 {
  version: number;
  windowHeight: number;
  windowWidth: number;
  dataDirectory?: string;
  logDirectory?: string;
}

export const configSchemaV2 = z.preprocess(
  (obj) => {
    const config = obj as ConfigV1 | ConfigV2;

    if (config.version === 1) {
      return {
        ...config,
        logDirectory: app.getPath("logs"),
      };
    }

    return config;
  },
  z.object({
    version: z.literal(1).transform(() => 2),
    windowHeight: z.number().min(1).default(DEFAULT_WINDOW_HEIGHT),
    windowWidth: z.number().min(1).default(DEFAULT_WINDOW_WIDTH),
    dataDirectory: z.string().optional(),
    logDirectory: z.string(),
  })
);
