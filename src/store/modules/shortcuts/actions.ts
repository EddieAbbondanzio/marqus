import { ShortcutGetters } from "@/store/modules/shortcuts/getters";
import { ShortcutMutations } from "@/store/modules/shortcuts/mutations";
import { Shortcut, ShortcutState } from "@/store/modules/shortcuts/state";
import { Actions } from "vuex-smart-module";
import { KeyCode, parseKey } from "./keyCode";
import { contexts } from "@/directives/context";
import { commands } from "@/commands";

export class ShortcutActions extends Actions<
  ShortcutState,
  ShortcutGetters,
  ShortcutMutations,
  ShortcutActions
> {
  setState(state: Shortcut[]) {
    this.commit("SET_STATE", state);

    // Apply the user defined shortcuts
    this.dispatch("map", state);
  }

  default(shortcuts: Shortcut[]) {
    for (const shortcut of shortcuts) {
      this.commit("REGISTER_SHORTCUT", shortcut);
    }
  }

  map(shortcuts: Shortcut[]) {
    for (const shortcut of shortcuts) {
      shortcut.userDefined = true;

      // If we are override an existing shortcut, (try to) remove the old one.
      this.commit("REMOVE_SHORTCUT_FOR_COMMAND", shortcut.command);
      this.commit("REGISTER_SHORTCUT", shortcut);
    }
  }

  keyDown(e: KeyboardEvent) {
    const key = parseKey(e.code);

    // Disable default arrow key actions
    if (
      key === KeyCode.ArrowLeft ||
      key === KeyCode.ArrowRight ||
      key === KeyCode.ArrowUp ||
      key === KeyCode.ArrowDown ||
      key === KeyCode.Tab
    ) {
      e.preventDefault();
    }

    /*
     * Prevent duplicate triggers from firing when keys with multiples
     * such as control (left side, right side) are pressed.
     */
    if (this.getters.isKeyDown(key)) {
      return;
    }

    this.commit("KEY_DOWN", key);

    const maps = this.state.map[this.getters.activeKeyString];

    if (maps == null || maps.length === 0) {
      return;
    }

    for (const { command, context } of maps) {
      if (context == null || contexts.isFocused(context)) {
        // commands.run(command as unknown as any, undefined);
      }
    }
  }

  keyUp(e: KeyboardEvent) {
    const key = parseKey(e.code);
    this.commit("KEY_UP", key);
  }
}
