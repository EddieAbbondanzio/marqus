import { store } from "@/store";
import { globalNavigation } from "@/store/modules/ui/modules/global-navigation";
import { Id } from "@/utils";
import { Command } from "../types";

export class DeleteTag extends Command<Id> {
  async execute(payload: Id): Promise<void> {
    const ctx = globalNavigation.context(store);
    await ctx.actions.tagDelete(payload);
  }
}
