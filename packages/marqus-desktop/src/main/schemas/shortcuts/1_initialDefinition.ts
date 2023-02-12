import { z } from "zod";
import { Section } from "../../../shared/ui/appState";
import { LIST_OF_EVENTS, UIEventType } from "../../../shared/ui/events";

interface ShortcutOverrideV1 {
  name?: string | undefined;
  event?: string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eventInput?: any | undefined;
  keys?: string | undefined;
  when?: Section | undefined;
  disabled?: boolean | undefined;
  repeat?: boolean | undefined;
}

interface ShortcutsV1 {
  version: 1;
  shortcuts?: ShortcutOverrideV1[];
}

export const OVERRIDE_SCHEMA: z.Schema<ShortcutOverrideV1> = z.object({
  // Name is how we determine whether it's an existing shortcut being updated,
  // or a new shortcut being added.
  name: z.string(),
  event: z
    .string()
    .refine(val => LIST_OF_EVENTS.includes(val as UIEventType))
    .optional(),
  eventInput: z.any().optional(),
  keys: z.string().optional(),
  when: z.nativeEnum(Section).optional(),
  disabled: z.boolean().optional(),
  repeat: z.boolean().optional(),
});

export const shortcutsV1: z.Schema<ShortcutsV1> = z.object({
  version: z.literal(1),
  shortcuts: z.array(OVERRIDE_SCHEMA).optional(),
});
