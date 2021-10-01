import { ShortcutGetters } from "@/store/modules/shortcuts/getters";
import { ShortcutMutations } from "@/store/modules/shortcuts/mutations";
import { ShortcutState } from "@/store/modules/shortcuts/state";
import { shortcuts } from "@/utils/shortcuts";
import { Actions } from "vuex-smart-module";

export class ShortcutActions extends Actions<
  ShortcutState,
  ShortcutGetters,
  ShortcutMutations,
  ShortcutActions
> {
  setState(state: ShortcutState) {
    this.commit("SET_STATE", state);

    // Apply the user defined shortcuts
    shortcuts.map(state.values);
    console.log("defined: ", state);
  }
}
