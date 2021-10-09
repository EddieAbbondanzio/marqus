import { contexts } from "@/directives/context";
import { store } from "@/store";
import { commandConsole } from "@/store/modules/ui/modules/commandConsole";
import { Command } from "../types";

export class Toggle extends Command<void> {
  async execute() {
    const ctx = commandConsole.context(store);
    if (ctx.state.modalActive) {
      ctx.actions.hide();
    } else {
      ctx.actions.show();
      contexts.focus({ name: "commandConsole" });
    }
  }
}
