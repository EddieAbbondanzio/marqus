import { z } from "zod";
import { ConfigV3 } from "./3_addDeveloperMode";

export interface ConfigV4 {
  version: number;
  windowHeight: number;
  windowWidth: number;
  dataDirectory?: string;
  logDirectory?: string;
  developerMode?: boolean;
  autoHideAppMenu?: boolean;
}

export const configSchemaV4: z.Schema<ConfigV4> = z.preprocess(
  obj => {
    const config = obj as ConfigV3 | ConfigV4;
    if (config.version === 3) {
      config.version = 4;
    }

    return config;
  },
  z.object({
    version: z.literal(4),
    windowHeight: z.number().min(1),
    windowWidth: z.number().min(1),
    dataDirectory: z.string().optional(),
    logDirectory: z.string(),
    developerMode: z.boolean().optional(),
    autoHideAppMenu: z.boolean().optional(),
  }),
);
