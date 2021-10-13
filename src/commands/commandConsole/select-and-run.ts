import { store } from "@/store";
import { commandConsole } from "@/store/modules/ui/modules/commandConsole";
import { Command } from "../types";

export class SelectAndRun extends Command<void> {
  async execute(): Promise<void> {
    const cc = commandConsole.context(store);
    cc.actions.selectAndRun();
  }
}
