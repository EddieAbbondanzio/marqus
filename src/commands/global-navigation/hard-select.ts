import { Command } from "../types";

export class HardSelect extends Command<void> {
  async execute(payload: void): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
