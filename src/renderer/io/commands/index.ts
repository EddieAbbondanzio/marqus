import { cloneDeep } from "lodash";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { State, UI } from "../../../shared/domain/state";
import { appCommands } from "./appCommands";
import { sidebarCommands } from "./sidebarCommands";
import {
  CommandInput,
  CommandSchema,
  CommandType,
  SetNotebooks,
  SetShortcuts,
  SetTags,
  SetUI,
} from "./types";

/*
 * Please don't refactor this unless you fully consider all the repurcussions.
 * - Intellisense completion is very important.
 * - Commands need to be able to get the most recent state at any time.
 */

export const commands: CommandSchema = {
  ...appCommands,
  ...sidebarCommands,
};

export type Execute = <C extends CommandType>(
  command: C,
  input?: CommandInput<C>
) => Promise<void>;

export function useCommands(initialState: State): [State, Execute, SetUI] {
  // Sampled: https://github.com/dai-shi/use-reducer-async/blob/main/src/index.ts

  const [state, setState] = useState(initialState);
  const lastState = useRef(state);

  useLayoutEffect(() => {
    lastState.current = state;
  }, [state]);

  const getState = useCallback(() => {
    const cloned = cloneDeep(lastState.current);
    return cloned;
  }, []);

  const setUI: SetUI = (transformer) => {
    setState((prevState) => {
      const newState = {
        ...prevState,
        ui: transformer(prevState.ui),
      };

      // Not the best place for this...
      const ui = cloneDeep(newState.ui);
      // delete ui.sidebar.tagInput;
      void window.rpc("state.saveUI", ui);

      return newState;
    });
  };

  /*
   * The following setters are to update local cache. They do not
   * perform any saving to file because all of that is handled by the rpcs.
   */

  const setTags: SetTags = (transformer) => {
    setState((prevState) => ({
      ...prevState,
      tags: transformer(prevState.tags),
    }));
  };
  const setNotebooks: SetNotebooks = (transformer) => {
    setState((prevState) => ({
      ...prevState,
      notebooks: transformer(prevState.notebooks),
    }));
  };
  const setShortcuts: SetShortcuts = (transformer) => {
    setState((prevState) => ({
      ...prevState,
      shortcuts: transformer(prevState.shortcuts),
    }));
  };

  const execute: Execute = useCallback(
    async (command, input) => {
      const handler = commands[command];
      if (handler == null) {
        throw Error(`No command ${command} found.`);
      }

      await handler(
        { setTags, setNotebooks, setShortcuts, getState, setUI },
        input as any
      );
    },
    [commands, getState]
  );

  return [state, execute, setUI];
}
