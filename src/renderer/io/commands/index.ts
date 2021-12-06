import React, {
  Dispatch,
  Reducer,
  ReducerState,
  SetStateAction,
  useCallback,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { State, UI } from "../../../shared/state";
import { appCommands } from "./appCommands";
import { CommandRegistry, CommandSchema } from "./types";

/**
 * Please don't refactor this unless you fully consider all the repurcussions.
 * - Intellisense completion is very important.
 * - Commands need to be able to get the most recent state at any time.
 */

export const commands: CommandRegistry = {
  ...appCommands,
};

export type Execute = <
  Command extends keyof typeof commands,
  Payload extends Parameters<CommandSchema[Command]>[1]
>(
  command: Command,
  payload?: Payload
) => Promise<void>;

/**
 * Set state does NOT save changes to file. Only use this for temporary state
 * changes that aren't persisted.
 */
export type SetUI = (ui: UI) => void;

export function useCommands(initialState: State): [State, Execute, SetUI] {
  // Sampled: https://github.com/dai-shi/use-reducer-async/blob/main/src/index.ts

  const [state, setState] = useState(initialState);
  const lastState = useRef(state);
  useLayoutEffect(() => {
    lastState.current = state;
  }, [state]);
  const getState = useCallback(() => lastState.current, []);

  const execute: Execute = useCallback(
    async (command, input) => {
      const handler = commands[command];
      if (handler == null) {
        throw Error(`No command ${command} found.`);
      }

      await handler({ setState, getState }, input as any);
    },
    [commands, getState]
  );

  const setUI = (ui: UI) => {
    setState({
      ...state,
      ui,
    });

    void window.rpc("state.saveUI", ui);
  };

  return [state, execute, setUI];
}
