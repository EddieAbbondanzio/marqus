import { store } from "@/store";
import { globalNavigation } from "@/store/modules/ui/modules/globalNavigation";
import { mediator } from "@/store/plugins/mediator";
import { Id } from "@/utils";
import { Command } from "../types";

export class RenameTag extends Command<Id> {
  async execute(id: Id): Promise<void> {
    const gn = globalNavigation.context(store);
    gn.actions.tagInputStart({ id, mode: "update" });
    // Listen in to see if we the input was confirmed, or stopped.
    await Promise.race([
      new Promise((res) =>
        mediator.subscribeOnce("ui/globalNavigation/tagInputConfirm", () =>
          res("confirm")
        )
      ),
      new Promise((res) =>
        mediator.subscribeOnce("ui/globalNavigation/tagInputCancel", () =>
          res("cancel")
        )
      ),
    ]);
  }
}
