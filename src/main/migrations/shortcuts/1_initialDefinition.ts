import { z } from "zod";
import { Section } from "../../../shared/ui/app";
import { LIST_OF_EVENTS, UIEventType } from "../../../shared/ui/events";
import { JsonMigration } from "../../json";
import { Shortcuts } from "../../shortcuts";

export const OVERRIDE_SCHEMA = z.object({
  // Name is how we determine whether it's an existing shortcut being updated,
  // or a new shortcut being added.
  name: z.string(),
  event: z
    .string()
    .refine((val) => LIST_OF_EVENTS.includes(val as UIEventType))
    .optional(),
  eventInput: z.any().optional(),
  keys: z.string().optional(),
  when: z.nativeEnum(Section).optional(),
  disabled: z.boolean().optional(),
  repeat: z.boolean().optional(),
});

export const SHORTCUTS_SCHEMA_V1 = z.object({
  version: z.literal(1).optional().default(1),
  shortcuts: z.array(OVERRIDE_SCHEMA).optional(),
});

type ShortcutsV1 = z.infer<typeof SHORTCUTS_SCHEMA_V1>;

export class ShortcutsInitialDefinition extends JsonMigration<
  ShortcutsV1,
  Shortcuts
> {
  version = 1;

  async validateInput(input: unknown): Promise<ShortcutsV1> {
    return await SHORTCUTS_SCHEMA_V1.parseAsync(input);
  }

  protected async migrate(input: ShortcutsV1): Promise<Shortcuts> {
    return input as unknown as Shortcuts;
  }
}
