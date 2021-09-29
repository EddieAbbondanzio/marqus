import { Command } from "../command";

export class TestCommand extends Command {
  async execute(): Promise<void> {
    console.log("exe");
  }
}
