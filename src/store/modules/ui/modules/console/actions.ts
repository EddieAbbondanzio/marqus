import { Actions } from "vuex-smart-module";
import { ConsoleGetters } from "./getters";
import { ConsoleMutations } from "./mutations";
import { ConsoleState } from "./state";

export class ConsoleActions extends Actions<
  ConsoleState,
  ConsoleGetters,
  ConsoleMutations,
  ConsoleActions
> {
  show() {
    this.commit("SHOW");
  }

  hide() {
    this.commit("HIDE");
  }
}
