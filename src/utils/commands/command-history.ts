import { Command } from "./command";

type CommandConstructor = new () => Command<any>;

const registry: {[name: string]: CommandConstructor} = {};

export const commands = {
  register(key: string, ctor: CommandConstructor) {
    if (registry[key] != null) {
      throw Error(`Command name collision. ${key} already exists`);
    }

    registry[key] = ctor;
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
