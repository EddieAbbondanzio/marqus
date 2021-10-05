import { Mutations } from "vuex-smart-module";
import { CommandConsoleState } from "./state";

export class CommandConsoleMutations extends Mutations<CommandConsoleState> {
  SHOW() {
    this.state.modalActive = true;
  }

  HIDE() {
    this.state.modalActive = false;
  }

  SET_ACTIVE(active: boolean) {
    this.state.modalActive = active;
  }

  SET_INPUT(input: string) {
    this.state.input = input;
  }

  CLEAR_INPUT() {
    this.state.input = "";
  }
}
