import { KeyCode } from "@/utils/shortcuts";

export interface Shortcut { name: string, keys: KeyCode[], userDefined?: boolean }

export class ShortcutState {
  values: Shortcut[] = [];
}
