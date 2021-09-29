import { ShortcutGetters } from "@/store/modules/shortcuts/getters";
import { ShortcutMutations } from "@/store/modules/shortcuts/mutations";
import { ShortcutState } from "@/store/modules/shortcuts/state";
import { Actions } from "vuex-smart-module";

export class ShortcutActions extends Actions<
  ShortcutState,
  ShortcutGetters,
  ShortcutMutations,
  ShortcutActions
> {
  setState(state: ShortcutState) {
    this.commit("SET_STATE", state);
  }
}
