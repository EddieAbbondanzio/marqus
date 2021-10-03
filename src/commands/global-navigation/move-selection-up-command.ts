import { store } from "@/store";
import { globalNavigation } from "@/store/modules/ui/modules/global-navigation";
import { Command } from "..";

export class MoveSelectionUpCommand extends Command<void> {
  async execute(): Promise<void> {
    const ctx = globalNavigation.context(store);
    ctx.actions.moveSelectionUp();
  }
}
