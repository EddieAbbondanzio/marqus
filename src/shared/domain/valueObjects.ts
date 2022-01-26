import { AwaitableInput } from "../awaitableInput";
import { KeyCode } from "../io/keyCode";
import { Note, NoteFlag } from "./entities";
import { Section } from "./state";

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
