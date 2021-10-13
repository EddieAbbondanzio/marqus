import { store } from "@/store";
import { commandConsole } from "@/store/modules/ui/modules/commandConsole";
import { Command } from "../types";

export class Select extends Command<void> {
  async execute(): Promise<void> {
    const cc = commandConsole.context(store);
    cc.actions.select();
  }
}
