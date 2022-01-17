import { AwaitableInput } from "../awaitableInput";
import { KeyCode } from "../io/keyCode";
import { Note, NoteFlag } from "./entities";
import { UISection } from "./state";

// Shortcut is not a resource because they are just values
export interface Shortcut {
  // Command is of type string as /shared doesn't have access to CommandType.
  command: string;
  keys: KeyCode[];
  disabled?: boolean;
  when?: UISection;
  repeat?: boolean;
  userDefined?: boolean;
}

export interface NoteMetadata {
  id: string;
  name: string;
  flags: NoteFlag;
}

export interface NoteGroup {
  name: string;
  children: Array<NoteGroup | NoteMetadata>;
}
