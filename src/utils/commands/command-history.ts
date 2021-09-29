import { Command } from "./command";

export const commandHistory = {
  async execute(command: Command) {
    await command.execute();
  }
};
