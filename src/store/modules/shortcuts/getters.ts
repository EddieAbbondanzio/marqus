import { keyCodesToString, ShortcutState } from "@/store/modules/shortcuts/state";
import { Getters } from "vuex-smart-module";
import { KeyCode } from "./key-code";

export class ShortcutGetters extends Getters<ShortcutState> {
  isKeyDown(key: KeyCode) {
    return this.state.activeKeys[key] != null;
  }

  get activeKeyString() {
    const active = Object.keys(this.state.activeKeys) as KeyCode[];
    return keyCodesToString(active);
  }
}
