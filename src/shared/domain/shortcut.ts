import { KeyCode } from "../io/keyCode";
import { ALL_SECTIONS, UIEventType, UIEventInput, Section } from "./ui";
import * as yup from "yup";

/*
 * Shortcuts are not entities because they are considered equal by value.
 * We only test for event and keys for equality.
 */
export interface Shortcut<EType extends UIEventType = UIEventType> {
  // Event is of type string as /shared doesn't have access to CommandType.
  event: EType;
  eventInput?: UIEventInput<EType>;
  keys: KeyCode[];
  disabled?: boolean;
  when?: Section;
  repeat?: boolean;
  userDefined?: boolean;
}

export const shortcutSchema: yup.SchemaOf<Shortcut> = yup.object().shape({
  event: yup.string().required() as any,
  eventInput: yup.mixed().optional(),
  keys: yup.array(),
  disabled: yup.boolean().optional(),
  when: yup.mixed().optional().oneOf(ALL_SECTIONS),
  repeat: yup.bool().optional(),
  userDefined: yup.bool().optional(),
});
