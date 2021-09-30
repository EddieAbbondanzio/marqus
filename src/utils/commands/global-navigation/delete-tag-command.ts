import { store } from "@/store";
import { Id } from "@/store/base";
import { globalNavigation } from "@/store/modules/ui/modules/global-navigation";
import { Command } from "../command";

export class DeleteTagCommand extends Command<Id> {
  async execute(payload: Id): Promise<void> {
    const ctx = globalNavigation.context(store);
    await ctx.actions.tagDelete(payload);
  }
}
