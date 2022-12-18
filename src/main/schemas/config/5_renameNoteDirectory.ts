import { z } from "zod";
import { ConfigV3 } from "./3_addDeveloperMode";
import { ConfigV4 } from "./4_addAutoHideAppMenu";

export interface ConfigV5 {
  version: number;
  windowHeight: number;
  windowWidth: number;
  noteDirectory?: string;
  logDirectory?: string;
  developerMode?: boolean;
  autoHideAppMenu?: boolean;
}

export const configSchemaV5: z.Schema<ConfigV5> = z.preprocess(
  obj => {
    const config = obj as ConfigV4 | ConfigV5;
    if (config.version === 4) {
      (config as ConfigV5).noteDirectory = (config as ConfigV4).dataDirectory;
      config.version = 5;
    }

    return config;
  },
  z.object({
    version: z.literal(5),
    windowHeight: z.number().min(1),
    windowWidth: z.number().min(1),
    noteDirectory: z.string().optional(),
    logDirectory: z.string(),
    developerMode: z.boolean().optional(),
    autoHideAppMenu: z.boolean().optional(),
  }),
);
