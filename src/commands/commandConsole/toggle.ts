// import { contexts } from "@/directives/context";
import { store } from "@/store";
import { userInterface } from "@/store/modules/ui";
import { commandConsole } from "@/store/modules/ui/modules/commandConsole";
import { Command } from "../types";

export class Toggle extends Command<void> {
  async execute() {
    const ui = userInterface.context(store);
    const cc = commandConsole.context(store);

    if (cc.state.modalActive) {
      cc.actions.hide();
    } else {
      cc.actions.show();
      ui.actions.focus({ name: "commandConsole" });
    }
  }
}
