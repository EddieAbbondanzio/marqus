// import { contexts } from "@/directives/context";
import { store } from "@/store";
import { userInterface } from "@/store/modules/ui";
import { commandConsole } from "@/store/modules/ui/modules/commandConsole";
import { Command } from "../types";

export class Hide extends Command<void> {
  async execute(): Promise<void> {
    const ui = userInterface.context(store);
    const cc = commandConsole.context(store);

    cc.actions.hide();
    ui.actions.blurFocused();
  }
}
