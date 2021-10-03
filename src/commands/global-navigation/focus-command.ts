import { contexts } from "@/utils";
import { Command } from "../command";

export class FocusCommand extends Command<void> {
  async execute(): Promise<void> {
    contexts.focus({ name: "globalNavigation" });
  }
}
