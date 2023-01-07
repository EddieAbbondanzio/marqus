import { z } from "zod";
import { ConfigV2 } from "./2_addLogDirectory";

export interface ConfigV3 {
  version: number;
  windowHeight: number;
  windowWidth: number;
  dataDirectory?: string;
  logDirectory?: string;
  developerMode?: boolean;
}

export const configSchemaV3 = z.preprocess(
  obj => {
    const config = obj as ConfigV2 | ConfigV3;
    if (config.version === 2) {
      config.version = 3;
    }

    return config;
  },
  z.object({
    version: z.literal(3),
    windowHeight: z.number().min(1),
    windowWidth: z.number().min(1),
    dataDirectory: z.string().optional(),
    logDirectory: z.string(),
    developerMode: z.boolean().optional(),
  }),
);
