import { PartialRecord } from "..";
import { Command } from "./command";

export type CommandConstructor = new () => Command<any>;

export interface CommandMapping {
  name: string;
  type: CommandConstructor
}

const registry: {[name: string]: CommandConstructor} = {};

export const commands = {
  register<T extends string>(rec: PartialRecord<T, CommandConstructor>) {
    for (const [name, type] of Object.entries(rec)) {
      if (registry[name] != null) {
        throw Error(`Command name collision. ${name} already exists`);
      }

      registry[name] = type as any;
    }
  },

  async run<T>(name: string, payload?: T) {
    const ctor = registry[name];

    if (ctor == null) {
      throw Error(`No command ${name} registered.`);
    }

    // eslint-disable-next-line new-cap
    const command = new ctor();
    await command.execute(payload);
  }
};
