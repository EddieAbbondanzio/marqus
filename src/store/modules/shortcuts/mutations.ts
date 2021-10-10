import { Mutations } from "vuex-smart-module";
import { KeyCode } from "./keyCode";
import { keyCodesToString, Shortcut, ShortcutState } from "./state";

export class ShortcutMutations extends Mutations<ShortcutState> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  SET_STATE(shortcuts: Shortcut[]) {
    for (const shortcut of shortcuts) {
      const keyString = keyCodesToString(shortcut.keys);

      (this.state.map[keyString] ??= []).push(shortcut);
      this.state.invertedMap[shortcut.command] = shortcut;
    }
  }

  REGISTER_SHORTCUT(shortcut: Shortcut) {
    const keyString = keyCodesToString(shortcut.keys);

    (this.state.map[keyString] ??= []).push(shortcut);
    this.state.invertedMap[shortcut.command] = shortcut;
  }

  REMOVE_SHORTCUT_FOR_COMMAND(command: string) {
    const existing = this.state.invertedMap[command];

    if (existing != null) {
      const keyString = keyCodesToString(existing.keys);

      this.state.map[keyString] = this.state.map[keyString].filter(
        (m) => m.command !== command
      );
    }
  }

  KEY_DOWN(code: KeyCode) {
    this.state.activeKeys[code] = true;
  }

  KEY_UP(code: KeyCode) {
    delete this.state.activeKeys[code];
  }
}
