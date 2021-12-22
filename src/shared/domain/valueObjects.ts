import { AwaitableInput } from "../awaitableInput";
import { KeyCode } from "../io/keyCode";
import { Note } from "./entities";
import { UISection } from "./state";

export interface Menu {
  name: string;
  children?: Menu[];
  notes?: Note[];
}

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
