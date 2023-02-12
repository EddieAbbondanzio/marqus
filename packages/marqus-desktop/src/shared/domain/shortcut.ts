import { KeyCode } from "../io/keyCode";
import { LIST_OF_EVENTS, UIEventInput, UIEventType } from "../ui/events";
import { Section } from "../ui/appState";
import { z } from "zod";

/*
 * Shortcuts are not resources because they are considered equal by value.
 * We only test name, event and keys for equality.
 */
export interface Shortcut<EType extends UIEventType = UIEventType> {
  // Name is used as a unique identifier so shortcuts can be overridden by the
  // user. Some shortcuts will use the same event (ex: focus.push) so we can't
  // rely on the event name as a unique identifier.
  name: string;
  event: EType;
  eventInput?: UIEventInput<EType>;
  keys: KeyCode[];
  disabled?: boolean;
  when?: Section;
  repeat?: boolean;
  userDefined?: boolean;
}

export const shortcutSchema = z.object({
  name: z.string().min(1),
  event: z.string().refine(val => LIST_OF_EVENTS.includes(val as UIEventType)),
  eventInput: z.any().optional(),
  keys: z.array(z.nativeEnum(KeyCode)),
  disable: z.boolean().optional(),
  when: z.nativeEnum(Section).optional(),
  repeat: z.boolean().optional(),
  userDefined: z.boolean().optional(),
});
