import { KeyCode } from "../io/keyCode";
import { ALL_SECTIONS, Section } from "../../renderer/state";
import * as yup from "yup";

/*
 * Shortcuts are not entities because any two shortcuts are considered equal
 * as long as they have the same command and keys.
 */
export interface Shortcut {
  // Event is of type string as /shared doesn't have access to CommandType.
  event: string;
  eventInput?: any;
  keys: KeyCode[];
  disabled?: boolean;
  when?: Section;
  repeat?: boolean;
  userDefined?: boolean;
}

export const shortcutSchema: yup.SchemaOf<Shortcut> = yup.object().shape({
  event: yup.string().required(),
  eventInput: yup.mixed().optional(),
  keys: yup.array(),
  disabled: yup.boolean().optional(),
  when: yup.mixed().optional().oneOf(ALL_SECTIONS),
  repeat: yup.bool().optional(),
  userDefined: yup.bool().optional(),
});
