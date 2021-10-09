import { store } from "@/store";
import { globalNavigation } from "@/store/modules/ui/modules/globalNavigation";
import { Command } from "../types";

export class MoveSelectionDown extends Command<void> {
  async execute(): Promise<void> {
    console.log("down!");
    const ctx = globalNavigation.context(store);
    ctx.actions.moveSelectionDown();
  }
}
