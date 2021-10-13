import { Id } from "@/utils";
import { Command } from "../types";

export class CreateNotebook extends Command<{ parentId: Id }> {
  async execute(payload: { parentId: Id }): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
