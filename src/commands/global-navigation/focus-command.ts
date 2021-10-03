import { contexts } from "@/directives/context";
import { Command } from "../command";

export class FocusCommand extends Command<void> {
  async execute(): Promise<void> {
    contexts.focus({ name: "globalNavigation" });
  }
}
