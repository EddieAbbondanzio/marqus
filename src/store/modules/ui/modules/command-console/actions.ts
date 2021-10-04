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
    this.commit("SHOW");
  }

  hide() {
    this.commit("HIDE");
  }
}
