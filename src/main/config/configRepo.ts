import { z } from "zod";
import { DEFAULT_WINDOW_HEIGHT, DEFAULT_WINDOW_WIDTH } from "..";
import { Config } from "../../shared/domain/config";
import { writeFile } from "../fileSystem";
import { loadAndMigrateJson, Versioned } from "../json";
import { CONFIG_MIRGATIONS } from "./migrations";

const configSchema = z
  .object({
    version: z.literal(1).optional().default(1),
    windowHeight: z.number().min(1).default(DEFAULT_WINDOW_HEIGHT),
    windowWidth: z.number().min(1).default(DEFAULT_WINDOW_WIDTH),
    dataDirectory: z.string().optional(),
  })
  .default({
    version: 1,
  });

// Interface is needed to support testing.
export interface IConfigRepo {
  get(): Promise<Config>;
  update(config: Config): Promise<Config>;
}

export class ConfigRepo implements IConfigRepo {
  constructor(private path: string) {}

  async get(): Promise<Config> {
    const config = await loadAndMigrateJson<Versioned<Config>>(
      this.path,
      CONFIG_MIRGATIONS
    );

    // We always want to run this because it'll apply defaults for any missing
    // values, and in the event the json file has been modified to the point
    // where it's unusuable, it'll throw an error instead of proceeding.
    const configProps = await configSchema.parseAsync(config);

    return new Config(
      configProps.windowHeight,
      configProps.windowWidth,
      configProps.dataDirectory
    );
  }

  async update(config: Config): Promise<Config> {
    const validated = await configSchema.parseAsync(config);

    await writeFile(this.path, validated, "json");
    return new Config(
      validated.windowHeight,
      validated.windowWidth,
      validated.dataDirectory
    );
  }
}
