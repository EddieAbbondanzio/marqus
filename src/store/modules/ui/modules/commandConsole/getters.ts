import { COMMAND_REGISTRY, NamespacedCommand } from "@/commands";
import { isBlank } from "@/utils";
import { Getters } from "vuex-smart-module";
import { CommandConsoleState } from "./state";

export class CommandConsoleGetters extends Getters<CommandConsoleState> {
  get suggestions(): NamespacedCommand[] {
    const input = this.state.input.toLowerCase();

    const commandNames = Object.keys(COMMAND_REGISTRY) as NamespacedCommand[];

    if (isBlank(input)) {
      return commandNames;
    }

    return commandNames.filter((c) => c.toLowerCase().includes(input));
  }
}
