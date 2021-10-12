import { commands, isNamespacedCommand } from "@/commands";
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

    this.commit("SET_SELECTION", 0);
  }

  hide() {
    this.commit("HIDE");
  }

  setActive(active: boolean) {
    this.commit("SET_ACTIVE", active);
  }

  setInput(input: string) {
    this.commit("SET_INPUT", input);

    this.commit("SET_SELECTION", 0);
  }

  clearInput() {
    this.commit("CLEAR_INPUT");
  }

  select() {
    const index = this.state.selectedIndex;
    const input = this.getters.suggestions[index];
    this.commit("SET_INPUT", input);
  }

  selectAndRun() {
    const index = this.state.selectedIndex;
    const input = this.getters.suggestions[index];

    if (input == null) {
      return;
    }

    // commands.run(input);
    this.commit("HIDE");
  }

  run() {
    const { input } = this.state;

    if (isNamespacedCommand(input)) {
      // commands.run(input);
    }

    this.commit("HIDE");
  }

  moveSelectionDown() {
    const next = Math.min(
      this.state.selectedIndex + 1,
      this.getters.suggestions.length
    );
    this.commit("SET_SELECTION", next);
  }

  moveSelectionUp() {
    const next = Math.max(this.state.selectedIndex - 1, 0);
    this.commit("SET_SELECTION", next);
  }
}
