import { Command } from "../command";

export class DeleteAllNotebooks extends Command<void> {
  execute(payload: void): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
