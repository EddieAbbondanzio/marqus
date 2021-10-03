import { store } from "@/store";
import { globalNavigation } from "@/store/modules/ui/modules/global-navigation";
import { Command } from "..";

export class MoveSelectionDownCommand extends Command<void> {
  async execute(): Promise<void> {
    console.log("down!");
    const ctx = globalNavigation.context(store);
    ctx.actions.moveSelectionDown();
  }
}
