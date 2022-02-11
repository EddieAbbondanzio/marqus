import { AwaitableInput } from "../awaitableInput";
import { KeyCode } from "../io/keyCode";
import { Section } from "../../renderer/store/state";
import * as yup from "yup";

/*
 * Shortcuts are not entities because any two shortcuts are considered equal
 * as long as they have the same command and keys.
 */
export interface Shortcut {
  // Command is of type string as /shared doesn't have access to CommandType.
  command: string;
  keys: KeyCode[];
  disabled?: boolean;
  when?: Section;
  repeat?: boolean;
  userDefined?: boolean;
}

export const shortcutSchema: yup.SchemaOf<Shortcut> = yup.object().shape({
  command: yup.string().required(),
  keys: yup.array(),
  disabled: yup.boolean().optional(),
  when: yup.mixed().optional().oneOf(["sidebar", "editor"]),
  repeat: yup.bool().optional(),
  userDefined: yup.bool().optional(),
});
