/* eslint-disable no-useless-constructor */

import _ from "lodash";
import { AppState } from "../ui/appState";
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

export type Execute = <
  Name extends CommandName,
  Payload extends Parameters<CommandRegistry[Name]>[1]
>(
  command: Name,
  payload: Payload
) => Promise<void>;

export function generateCommands(state: AppState): Execute {
  return async (name, payload: any) => {
    const command: Command<any> = COMMAND_REGISTRY[name];

    if (command == null) {
      console.log(COMMAND_REGISTRY);
      throw Error(`No command ${name} registered.`);
    }

    /*
     * Making a deep copy of state allows us to make changes without applying
     * anything until we call commit().
     */
    let stateCopy = _.cloneDeep(state);
    let called: "commit" | "rollback" | undefined;

    /**
     * Apply local changes made to state from a command.
     * @param newState The new application state to save.
     */
    const commit = async (newState: AppState): Promise<void> => {
      if (called != null) {
        throw Error(`Cannot commit. Already called ${called}`);
      }

      state = newState;
      // await window.appState.set(newState);
      called = "commit";
    };

    /**
     * Revert local changes made by a command.
     */
    const rollback = async (): Promise<void> => {
      if (called != null) {
        throw Error(`Cannot rollback. Already called ${called}`);
      }

      called = "rollback";
    };

    await command({ state: stateCopy, commit, rollback }, payload);
  };
}
