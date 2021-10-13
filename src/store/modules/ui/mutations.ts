import { MutationTree } from "vuex";
import { Mutations } from "vuex-smart-module";
import { Focusable, UserInterfaceState } from "./state";

export class UserInterfaceMutations extends Mutations<UserInterfaceState> {
  SET_STATE(s: UserInterfaceState) {
    Object.assign(this.state, s);
  }

  SET_CURSOR_ICON(icon: string) {
    this.state.cursor.icon = icon;
  }

  RESET_CURSOR_ICON() {
    this.state.cursor.icon = "pointer";
  }

  CURSOR_DRAGGING(dragging?: boolean) {
    this.state.cursor.dragging = dragging;
  }

  ADD_FOCUSABLE(focusable: Focusable) {
    this.state.focusables.push(focusable);
  }

  REMOVE_FOCUSABLE(focusable: Focusable) {
    const index = this.state.focusables.findIndex((f) => f.id === focusable.id);
    this.state.focusables.splice(index, 1);
  }

  SET_ACTIVE(f: Focusable) {
    this.state.active = f;
  }

  CLEAR_ACTIVE() {
    delete this.state.active;
  }
}
