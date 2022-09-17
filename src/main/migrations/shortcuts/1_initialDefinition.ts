import { z } from "zod";
import { shortcutSchema } from "../../../shared/domain/shortcut";
import { JsonMigration } from "../../json";
import { Shortcuts } from "../../shortcuts";

export const shortcutsSchemaV1 = z.object({
  version: z.literal(1).optional().default(1),
  shortcuts: z.array(shortcutSchema).optional(),
});

type ShortcutsV1 = z.infer<typeof shortcutsSchemaV1>;

export class ShortcutsInitialDefinition extends JsonMigration<
  ShortcutsV1,
  Shortcuts
> {
  version = 1;

  async validateInput(input: unknown): Promise<ShortcutsV1> {
    return await shortcutsSchemaV1.parseAsync(input);
  }

  protected async migrate(input: ShortcutsV1): Promise<Shortcuts> {
    return input as unknown as Shortcuts;
  }
}
