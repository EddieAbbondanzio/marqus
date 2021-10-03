import { Id } from "@/utils";
import { Command } from "../command";

export class DeleteNotebookCommand extends Command<Id> {
  execute(payload: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
