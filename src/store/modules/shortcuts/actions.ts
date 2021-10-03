import { ShortcutGetters } from "@/store/modules/shortcuts/getters";
import { ShortcutMutations } from "@/store/modules/shortcuts/mutations";
import { keyCodesToString, ShortcutMapping, ShortcutRaw, ShortcutState } from "@/store/modules/shortcuts/state";
import { flatten, OneOrMore } from "@/utils";
import { commands } from "@/commands";
import { Actions } from "vuex-smart-module";
import { KeyCode, parseKey } from "./key-code";
import { contexts } from "@/directives/context";

export class ShortcutActions extends Actions<
  ShortcutState,
  ShortcutGetters,
  ShortcutMutations,
  ShortcutActions
> {
  setState(state: ShortcutMapping[]) {
    this.commit("SET_STATE", state);

    // Apply the user defined shortcuts
    this.dispatch("map", state);
  }

  default(mappings: OneOrMore<ShortcutRaw<any>>) {
    for (const { command, keys, context } of flatten(mappings)) {
      const keyString = Array.isArray(keys) ? keyCodesToString(keys) : keys;

      // Set up the new one
      this.commit("CREATE_SHORTCUT", {
        command,
        keyString,
        context
      });
    }
  }

  map(mappings: OneOrMore<ShortcutMapping>) {
    for (const { command, keys, context } of flatten(mappings)) {
      const keyString = Array.isArray(keys) ? keyCodesToString(keys) : keys;

      // If we are override an existing shortcut, (try to) remove the old one.
      this.commit("REMOVE_SHORTCUT_FOR_COMMAND", command);

      // Set up the new one
      this.commit("CREATE_SHORTCUT", {
        command,
        keyString,
        context,
        userDefined: true
      });
    }
  }

  keyDown(e: KeyboardEvent) {
    const key = parseKey(e.code);

    // Disable default arrow key actions
    if (
      key === KeyCode.ArrowLeft ||
      key === KeyCode.ArrowRight ||
      key === KeyCode.ArrowUp ||
      key === KeyCode.ArrowDown
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
        commands.run(command as unknown as any, undefined);
      }
    }
  }

  keyUp(e: KeyboardEvent) {
    const key = parseKey(e.code);
    this.commit("KEY_UP", key);
  }
}
