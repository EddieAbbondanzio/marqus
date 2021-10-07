/* eslint-disable no-useless-constructor */
import { COMMAND_CONSOLE_REGISTRY } from "./command-console";
import { GLOBAL_NAVIGATION_REGISTRY } from "./global-navigation";

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
  const mappings: Record<string, T> = {};

  for (const [path, constructor] of Object.entries(registry)) {
    mappings[`${namespace}.${path}`] = constructor as any;
  }

  // Casts aren't the best but they get the job done.
  return mappings as Namespaced<N, T>;
}

export const COMMAND_REGISTRY = {
  ...namespace("globalNavigation", GLOBAL_NAVIGATION_REGISTRY),
  ...namespace("commandConsole", COMMAND_CONSOLE_REGISTRY)
};

export type CommandRegistry = typeof COMMAND_REGISTRY;
export type NamespacedCommand = keyof CommandRegistry;

export function isNamespacedCommand(str: string): str is NamespacedCommand {
  return Object.keys(COMMAND_REGISTRY).some(c => c === str);
}

export function generate(registry: CommandRegistry) {
  /*
   * Here be dragons
   */

  async function run<C extends NamespacedCommand, P extends Parameters<CommandRegistry[C]["prototype"]["execute"]>>(
    name: C, ...payload: P
  ): Promise<void> {
    const ctor = registry[name];

    if (ctor == null) {
      throw Error(`No command ${name} registered.`);
    }

    // eslint-disable-next-line new-cap
    const command = new (ctor as any)();
    await command.execute(...payload); // Payload comes in as an array so we have to spread it
  }

  return {
    run
  };
}

export const commands = generate(COMMAND_REGISTRY);
