/* eslint-disable no-useless-constructor */

import { GLOBAL_NAVIGATION_REGISTRY } from "./globalNavigation";
import { Command } from "./types";

/**
 * Prefix a namespace to every property name delimited via a period.
 */
type Namespaced<N extends string, T> = {
  [K in Extract<keyof T, string> as `${N}.${K}`]: T[K];
};

/**
 * Add a namespace to the front of every command. { foo: Command } => { namespace.foo: Command }
 * @param namespace The namespace to prefix to the commands.
 * @param registry The command registry to map
 * @returns The newly namespaced commands
 */
function namespace<N extends string, T extends Record<string, unknown>>(
  namespace: N,
  registry: T
): Namespaced<N, T> {
  const mappings: Record<string, T> = {};

  for (const [path, constructor] of Object.entries(registry)) {
    mappings[`${namespace}.${path}`] = constructor as any;
  }

  // Casts aren't the best but they get the job done.
  return mappings as Namespaced<N, T>;
}

export const COMMAND_REGISTRY = {
  ...namespace("globalNavigation", GLOBAL_NAVIGATION_REGISTRY),
};

export type CommandRegistry = typeof COMMAND_REGISTRY;
export type CommandName = keyof CommandRegistry;

export function isCommandName(str: string): str is CommandName {
  return Object.keys(COMMAND_REGISTRY).some((c) => c === str);
}

export async function execute<
  C extends CommandName,
  P extends Parameters<CommandRegistry[C]>
>(name: C, ...payload: P): Promise<void> {
  const command: Command = COMMAND_REGISTRY[name];

  if (command == null) {
    console.log(COMMAND_REGISTRY);
    throw Error(`No command ${name} registered.`);
  }

  await command(payload as any);
}
