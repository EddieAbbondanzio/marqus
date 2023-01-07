import { app } from "electron";
import { z } from "zod";
import { ConfigV1 } from "./1_initialDefinition";

export interface ConfigV2 {
  version: number;
  windowHeight: number;
  windowWidth: number;
  dataDirectory?: string;
  logDirectory?: string;
}

export const configSchemaV2: z.Schema<ConfigV2> = z.preprocess(
  obj => {
    const config = obj as ConfigV1 | ConfigV2;

    if (config.version === 1) {
      return {
        ...config,
        version: 2,
        logDirectory: app.getPath("logs"),
      };
    }

    return config;
  },
  z.object({
    version: z.literal(2),
    windowHeight: z.number().min(1),
    windowWidth: z.number().min(1),
    dataDirectory: z.string().optional(),
    logDirectory: z.string(),
  }),
);
