import { contexts } from "@/directives/context";
import { store } from "@/store";
import { commandConsole } from "@/store/modules/ui/modules/console";
import { Command } from "../command";

export class ToggleConsole extends Command<void> {
  async execute() {
    const ctx = commandConsole.context(store);
    if (ctx.state.modalActive) {
      ctx.actions.hide();
    } else {
      ctx.actions.show();
      contexts.focus({ name: "console" });
    }
  }
}
