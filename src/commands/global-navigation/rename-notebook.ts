import { Id } from "@/utils";
import { Command } from "../types";

export class RenameNotebook extends Command<Id> {
  async execute(payload: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
