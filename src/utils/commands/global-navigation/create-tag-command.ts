import { store } from "@/store";
import { globalNavigation } from "@/store/modules/ui/modules/global-navigation";
import { Command } from "../command";

export class CreateTagCommand extends Command {
  async execute(): Promise<void> {
    const mediator = {} as any;

    const ctx = globalNavigation.context(store);
    ctx.actions.tagInputStart();

    const confirm = new Promise(res => mediator.subscribeOnce("tagInputConfirm", () => res("confirm")));
    const cancel = new Promise(res => mediator.subscribeOnce("tagInputCancel", () => res("cancel")));

    const outcome = await Promise.race([confirm, cancel]);
    console.log("create tag ended: ", outcome);
  }
}
