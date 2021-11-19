/* eslint-disable no-useless-constructor */

import _ from "lodash";
import { State } from "../../shared/domain";
import { GLOBAL_NAVIGATION_REGISTRY } from "./globalNavigation";
import { TAG_REGISTRY } from "./reducers/tags";
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
  ...namespace("tags", TAG_REGISTRY),
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

export function useCommands(
  state: State,
  setAppState: (s: State) => Promise<void>
): Execute {
  return async (name, payload: any) => {
    const command: Command<any> = COMMAND_REGISTRY[name];

    if (command == null) {
      throw Error(`No command ${name} registered.`);
    }

    /*
     * Making a deep copy of state allows us to make changes without applying
     * anything until we call commit(). Sometimes we might start making changes
     * to state but need to cancel things out and revert back to the previous
     */
    let stateCopy = _.cloneDeep(state);
    let called: "commit" | "rollback" | undefined;

    /**
     * Apply local changes made to state from a command.
     * @param newState The new application state to save.
     */
    const commit = async (newState: State): Promise<void> => {
      if (called != null) {
        throw Error(`Cannot commit. Already called ${called}`);
      }

      state = newState;
      await setAppState(newState);
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
