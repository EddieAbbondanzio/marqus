import { z } from "zod";
import { ConfigV5 } from "./5_renameNoteDirectory";

export interface ConfigV6 {
  version: number;
  windowHeight: number;
  windowWidth: number;
  noteDirectory?: string;
  logDirectory?: string;
  developerMode?: boolean;
  autoHideAppMenu?: boolean;
  tabSize?: number;
}

export const configSchemaV6 = z.preprocess(
  obj => {
    const config = obj as ConfigV5 | ConfigV6;
    if (config.version === 5) {
      config.version = 6;
    }

    return config;
  },
  z.object({
    version: z.literal(6),
    windowHeight: z.number().min(1),
    windowWidth: z.number().min(1),
    noteDirectory: z.string().optional(),
    logDirectory: z.string(),
    developerMode: z.boolean().optional(),
    autoHideAppMenu: z.boolean().optional(),
    tabSize: z.number().min(1).optional(),
  }),
);
