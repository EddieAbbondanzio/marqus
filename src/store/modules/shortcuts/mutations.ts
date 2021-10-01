import { ShortcutState } from "@/store/modules/shortcuts/state";
import { Mutations } from "vuex-smart-module";

export class ShortcutMutations extends Mutations<ShortcutState> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  SET_STATE(s: ShortcutState) {
    // Object.assign(this.state, s);
    // shortcuts.define(s);
  }
}
