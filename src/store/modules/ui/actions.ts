import { UserInterfaceGetters } from "@/store/modules/ui/getters";
import { UserInterfaceMutations } from "@/store/modules/ui/mutations";
import { Actions } from "vuex-smart-module";
import { UserInterfaceState } from "./state";

export class UserInterfaceActions extends Actions<
  UserInterfaceState,
  UserInterfaceGetters,
  UserInterfaceMutations,
  UserInterfaceActions
> {
  setState(state: UserInterfaceState) {
    this.commit("SET_STATE", state);
  }

  cursorDraggingStart() {
    this.commit("SET_CURSOR_ICON", "grabbing");
    this.commit("CURSOR_DRAGGING", true);
  }

  cursorDraggingStop() {
    this.commit("RESET_CURSOR_ICON");
    this.commit("CURSOR_DRAGGING", false);
  }
}
