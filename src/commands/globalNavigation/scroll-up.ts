import { store } from "@/store";
import { globalNavigation } from "@/store/modules/ui/modules/globalNavigation";
import { Command } from "../types";

export class ScrolUp extends Command<void> {
  async execute(): Promise<void> {
    // const ctx = globalNavigation.context(store);
    // ctx.actions.scrollUp();
  }
}
