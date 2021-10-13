import { Command } from "../types";

export class SoftSelect extends Command<void> {
  async execute(payload: void): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
