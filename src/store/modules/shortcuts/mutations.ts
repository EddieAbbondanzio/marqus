import { MutationTree, Store } from "vuex";
import { ShortcutState } from "@/store/modules/shortcuts/state";
import { Mutations } from "vuex-smart-module";
import { shortcuts } from "@/utils/shortcuts/shortcuts";

export class ShortcutMutations extends Mutations<ShortcutState> {
  SET_STATE(s: ShortcutState) {
    Object.assign(this.state, s);
    shortcuts.register(s.values);
  }
}
