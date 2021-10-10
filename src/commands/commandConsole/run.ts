import { store } from "@/store";
import { commandConsole } from "@/store/modules/ui/modules/commandConsole";
import { Command } from "../types";

export class Run extends Command<void> {
  async execute() {
    const ctx = commandConsole.context(store);
    ctx.actions.run();
  }
}
