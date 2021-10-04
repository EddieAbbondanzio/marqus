import { Mutations } from "vuex-smart-module";
import { ConsoleState } from "./state";

export class ConsoleMutations extends Mutations<ConsoleState> {
  SHOW() {
    this.state.modalActive = true;
  }

  HIDE() {
    this.state.modalActive = false;
  }
}
