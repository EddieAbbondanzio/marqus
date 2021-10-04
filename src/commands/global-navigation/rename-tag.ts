import { store } from "@/store";
import { globalNavigation } from "@/store/modules/ui/modules/global-navigation";
import { mediator } from "@/store/plugins/mediator";
import { Id } from "@/utils";
import { Command } from "../command";

export class RenameTag extends Command<Id> {
  async execute(id: Id): Promise<void> {
    const context = globalNavigation.context(store);
    context.actions.tagInputStart({ id, mode: "update" });

    // Listen in to see if we the input was confirmed, or stopped.
    await Promise.race([
      new Promise(res => mediator.subscribeOnce(
        "ui/globalNavigation/tagInputConfirm",
        () => res("confirm")
      )),
      new Promise(res => mediator.subscribeOnce(
        "ui/globalNavigation/tagInputCancel",
        () => res("cancel")
      ))
    ]);
  }
}
