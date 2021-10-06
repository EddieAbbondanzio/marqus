import { useCommandConsole } from "@/store/modules/ui/modules/command-console";
import { Command } from "../types";

export class MoveSelectionDown extends Command<void> {
  async execute(): Promise<void> {
    const ctx = useCommandConsole();
    ctx.actions.moveSelectionDown();
  }
}
