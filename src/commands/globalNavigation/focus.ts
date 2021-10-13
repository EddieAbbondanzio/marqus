// import { contexts } from "@/directives/context";
import { store } from "@/store";
import { userInterface } from "@/store/modules/ui";
import { Command } from "../types";

export class Focus extends Command<void> {
  async execute(): Promise<void> {
    const ui = userInterface.context(store);
    ui.actions.focus({ name: "globalNavigation" });
  }
}
