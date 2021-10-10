import { useCommandConsole } from "@/store/modules/ui/modules/commandConsole";
import { Command } from "../types";

export class Show extends Command<void> {
  async execute(): Promise<void> {
    const ctx = useCommandConsole();
    ctx.actions.show();
  }
}
