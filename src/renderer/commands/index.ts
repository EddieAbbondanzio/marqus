/* eslint-disable no-useless-constructor */

import _ from "lodash";
import { State } from "../../shared/state";
import { SaveState, useAppContext } from "../App";
import { APP_REGISTRY } from "./app";
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
  ...namespace("app", APP_REGISTRY),
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

export function useCommands(state: State, saveState: SaveState): Execute {
  /*
   * Prevent stale closure:
   * https://dmitripavlutin.com/react-hooks-stale-closures/
   */
  let s = state;
  let save = saveState;

  return async (name, payload: any) => {
    console.log("exe command: ", s);
    const command: Command<any> = COMMAND_REGISTRY[name];

    if (command == null) {
      throw Error(`No command ${name} registered.`);
    }

    // let stateCopy = _.cloneDeep(s);
    let rollbackCopy = _.cloneDeep(s);

    /**
     * Apply local changes made to state from a command.
     * @param newState The new application state to save.
     */
    const commit = async (newState: State): Promise<void> => {
      console.log("commit: ", newState);
      await save(newState);
    };

    /**
     * Revert local changes made by a command.
     */
    const rollback = async (): Promise<void> => {
      console.log("rollback: ", rollbackCopy);
      await save(rollbackCopy);
    };

    await command({ state: s, commit, rollback }, payload);
  };
}
