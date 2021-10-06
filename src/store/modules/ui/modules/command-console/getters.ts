import { CommandName, COMMANDS } from "@/commands";
import { isBlank } from "@/utils";
import { Getters } from "vuex-smart-module";
import { CommandConsoleState } from "./state";

export class CommandConsoleGetters extends Getters<CommandConsoleState> {
  get suggestions(): CommandName[] {
    const input = this.state.input.toLowerCase();

    const commandNames = Object.keys(COMMANDS) as CommandName[];

    if (isBlank(input)) {
      return commandNames;
    }

    return commandNames.filter(c => c.toLowerCase().includes(input));
  }
}
