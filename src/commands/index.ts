/* eslint-disable no-useless-constructor */
import { COMMAND_CONSOLE_REGISTRY } from "./command-console";
import { GLOBAL_NAVIGATION_REGISTRY } from "./global-navigation";
import { Command } from "./types";

/**
 * Prefix a namespace to every property name delimited via a period.
 */
type Namespaced<N extends string, T> = {
  [K in Extract<keyof T, string> as `${N}.${K}`]: T[K]
};

/**
 * Add a namespace to the front of every command. { foo: Command } => { namespace.foo: Command }
 * @param namespace The namespace to prefix to the commands.
 * @param registry The command registry to map
 * @returns The newly namespaced commands
 */
function namespace<N extends string, T extends Record<string, unknown>>(namespace: N, registry: T): Namespaced<N, T> {
  return Object.assign({}, ...Object.entries(registry).map(([property, value]) => [`${namespace}.${property}`, value]));
}

export const COMMAND_REGISTRY = {
  ...namespace("globalNavigation", GLOBAL_NAVIGATION_REGISTRY),
  ...namespace("commandConsole", COMMAND_CONSOLE_REGISTRY)
};

export type CommandRegistry = typeof COMMAND_REGISTRY;
export type NamespacedCommand = keyof CommandRegistry;

export function generate(registry: CommandRegistry) {
  /*
   * Here be dragons
   */

  async function run<C extends NamespacedCommand, P extends Parameters<CommandRegistry[C]["prototype"]["execute"]>>(
    name: C, ...payload: P
  ): Promise<void> {
    const ctor = registry[name];

    if (ctor == null) {
      console.log(registry);
      throw Error(`No command ${name} registered.`);
    }

    // eslint-disable-next-line new-cap
    const command = new (ctor as any)();
    await command.execute(payload);
  }

  return {
    run
  };
}

export const commands = generate(COMMAND_REGISTRY);
