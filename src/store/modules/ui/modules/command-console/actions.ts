import { Actions } from "vuex-smart-module";
import { CommandConsoleGetters } from "./getters";
import { CommandConsoleMutations } from "./mutations";
import { CommandConsoleState } from "./state";

export class CommandConsoleActions extends Actions<
  CommandConsoleState,
  CommandConsoleGetters,
  CommandConsoleMutations,
  CommandConsoleActions
> {
  show() {
    this.commit("CLEAR_INPUT");
    this.commit("SHOW");
  }

  hide() {
    this.commit("HIDE");
  }

  setActive(active: boolean) {
    this.commit("SET_ACTIVE", active);
  }

  setInput(input: string) {
    this.commit("SET_INPUT", input);
  }

  clearInput() {
    this.commit("CLEAR_INPUT");
  }

  moveSelectionDown() {
    this.commit("MOVE_SELECTION_DOWN");
  }

  moveSelectionUp() {
    this.commit("MOVE_SELECTION_UP");
  }
}
