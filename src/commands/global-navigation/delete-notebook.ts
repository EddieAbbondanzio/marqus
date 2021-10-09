import { Id } from "@/utils";
import { Command } from "../types";

export class DeleteNotebook extends Command<Id> {
  execute(payload: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
