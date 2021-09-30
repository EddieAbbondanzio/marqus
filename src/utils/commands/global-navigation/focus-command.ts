import { inputScopes } from "@/utils";
import { Command } from "../command";

export class FocusCommand extends Command<void> {
  async execute(): Promise<void> {
    inputScopes.focus({ name: "globalNavigation" });
  }
}
