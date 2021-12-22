import { AwaitableInput } from "../awaitableInput";
import { KeyCode } from "../io/keyCode";
import { UISection } from "./state";

export interface Menu {
  name: string;
  menuResource: "tag" | "notebook" | "note";
  children?: Menu[];
  input?: AwaitableInput;
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
