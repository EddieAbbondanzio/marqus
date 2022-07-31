import { z } from "zod";
import { DEFAULT_WINDOW_HEIGHT, DEFAULT_WINDOW_WIDTH } from "../..";
import { Config } from "../../../shared/domain/config";
import { JsonMigration } from "../../json";

export const configSchemaV1 = z.object({
  version: z.literal(1).optional().default(1),
  windowHeight: z.number().min(1).default(DEFAULT_WINDOW_HEIGHT),
  windowWidth: z.number().min(1).default(DEFAULT_WINDOW_WIDTH),
  dataDirectory: z.string().optional(),
});

type ConfigV1 = z.infer<typeof configSchemaV1>;

export class ConfigInitialDefinition extends JsonMigration<ConfigV1, Config> {
  version = 1;

  async validateInput(input: unknown): Promise<ConfigV1> {
    return await configSchemaV1.parseAsync(input);
  }

  protected async migrate(input: ConfigV1): Promise<Config> {
    return new Config(
      input.windowHeight,
      input.windowWidth,
      input.dataDirectory
    );
  }
}
