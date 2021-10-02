import { ShortcutMapping, ShortcutState } from "@/store/modules/shortcuts/state";
import { Mutations } from "vuex-smart-module";
import { KeyCode } from "./key-code";

export class ShortcutMutations extends Mutations<ShortcutState> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  SET_STATE(s: ShortcutMapping[]) {
    for (const { command, keys, userDefined, context } of s) {
      (this.state.map[keys] ??= []).push({ command, context });
      this.state.invertedMap[command] = { keys, userDefined };
    }

    console.log("set this: ", s);
  }

  CREATE_SHORTCUT(
    { command, keyString, context, userDefined }
    : {command: string, keyString: string, context?: string, userDefined?: boolean }) {
    (this.state.map[keyString] ??= []).push({ command, context });
    this.state.invertedMap[command] = { keys: keyString, userDefined };
  }

  REMOVE_SHORTCUT_FOR_COMMAND(command: string) {
    const existing = this.state.invertedMap[command];

    if (existing != null) {
      this.state.map[existing.keys] = this.state.map[existing.keys].filter(m => m.command !== command);
    }
  }

  KEY_DOWN(code: KeyCode) {
    this.state.activeKeys[code] = true;
  }

  KEY_UP(code: KeyCode) {
    delete this.state.activeKeys[code];
  }
}
