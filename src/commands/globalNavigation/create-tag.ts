import { store } from "@/store";
import { globalNavigation } from "@/store/modules/ui/modules/global-navigation";
import { mediator } from "@/store/plugins/mediator";
import { generateId } from "@/utils";
import { Command } from "../types";

export class CreateTag extends Command<void> {
  async execute(): Promise<void> {
    console.log("CREATE TAG!");
    const id = generateId();
    const globalNavCtx = globalNavigation.context(store);

    globalNavCtx.actions.tagInputStart({ id, mode: "create" });

    // Listen in to see if we the input was confirmed, or stopped.
    await Promise.race([
      new Promise(res => mediator.subscribeOnce(
        "ui/globalNavigation/tagInputConfirm",
        res
      )),
      new Promise(res => mediator.subscribeOnce(
        "ui/globalNavigation/tagInputCancel",
        res
      ))
    ]);
  }
}
