import { contexts } from "@/directives/context";
import { store } from "@/store";
import { commandConsole } from "@/store/modules/ui/modules/console";
import { Command } from "../command";

export class HideConsole extends Command<void> {
  async execute(): Promise<void> {
    const ctx = commandConsole.context(store);
    ctx.actions.hide();
    contexts.blur();
  }
}
