import { z } from "zod";
import { DEFAULT_WINDOW_HEIGHT, DEFAULT_WINDOW_WIDTH } from "../../ipc/config";

export interface ConfigV1 {
  version: number;
  windowHeight: number;
  windowWidth: number;
  dataDirectory?: string;
}

export const configSchemaV1: z.Schema<ConfigV1> = z.preprocess(
  (obj: unknown) => {
    const config = obj as Partial<ConfigV1>;

    config.windowHeight ??= DEFAULT_WINDOW_HEIGHT;
    config.windowWidth ??= DEFAULT_WINDOW_WIDTH;

    return obj;
  },
  z.object({
    version: z.literal(1),
    windowHeight: z.number().min(1),
    windowWidth: z.number().min(1),
    dataDirectory: z.string().optional(),
  }),
);
