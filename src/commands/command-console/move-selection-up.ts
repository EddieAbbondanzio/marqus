import { store } from "@/store";
import { commandConsole } from "@/store/modules/ui/modules/command-console";
import { Command } from "../types";

export class MoveSelectionUp extends Command<void> {
  async execute(): Promise<void> {
    const ctx = commandConsole.context(store);
    ctx.actions.moveSelectionUp();
  }
}
