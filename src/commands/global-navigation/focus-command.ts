import { contexts } from "@/directives/context";
import { Command } from "..";

export class FocusCommand extends Command<void> {
  async execute(): Promise<void> {
    contexts.focus({ name: "globalNavigation" });
  }
}
