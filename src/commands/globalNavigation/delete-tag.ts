import { store } from "@/store";
import { globalNavigation } from "@/store/modules/ui/modules/globalNavigation";
import { Id } from "@/utils";
import { Command } from "../types";

export class DeleteTag extends Command<Id> {
  async execute(payload: Id): Promise<void> {
    // const ctx = globalNavigation.context(store);
    // await ctx.actions.tagDelete(payload);
  }
}
