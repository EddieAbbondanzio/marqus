import { CommandName } from "../commands";
import { KeyCode } from "./keyCode";

export interface Shortcut {
  command: CommandName;
  keys: KeyCode[];
}
