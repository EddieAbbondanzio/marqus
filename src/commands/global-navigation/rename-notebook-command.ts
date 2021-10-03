import { Id } from "@/utils";
import { Command } from "../command";

export class RenameNotebookCommand extends Command<Id> {
  async execute(payload: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
