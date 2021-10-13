import { store } from "@/store";
import { globalNavigation } from "@/store/modules/ui/modules/globalNavigation";
import { Command } from "../types";

export class MoveSelectionUp extends Command<void> {
  async execute(): Promise<void> {
    const gn = globalNavigation.context(store);
    gn.actions.moveSelectionUp();
  }
}
