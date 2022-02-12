import { cloneDeep, merge, mergeWith } from "lodash";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { State, UI } from "../../store/state";
import { deepUpdate } from "../../utils/deepUpdate";
import { appCommands } from "./appCommands";
import { sidebarCommands } from "./sidebarCommands";
import {
  CommandInput,
  CommandSchema,
  CommandType,
  SetNotebooks,
  SetNotes,
  SetShortcuts,
  SetTags,
  SetUI,
} from "./types";

/*
 * Please don't refactor this unless you fully consider all the requirements.
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

// Commands really only oeprate on UI
export function useCommands(previousState: State): [State, Execute, SetUI] {
  // Sampled: https://github.com/dai-shi/use-reducer-async/blob/main/src/index.ts

  const [state, setState] = useState(previousState);
  const lastState = useRef(state);

  // We need to run these first
  useLayoutEffect(() => {
    lastState.current = state;
  }, [state]);

  const getState = () => {
    const cloned = cloneDeep(lastState.current);
    return cloned;
  };

  const setUI: SetUI = (transformer) => {
    setState((prevState) => {
      const updates =
        typeof transformer === "function"
          ? transformer(prevState.ui)
          : transformer;

      const ui = deepUpdate(prevState.ui, updates);
      const newState = {
        ...prevState,
        ui,
      };

      void window.rpc("app.saveUIState", cloneDeep(newState.ui));
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
    console.log("setNotebooks()");
    setState((prevState) => ({
      ...prevState,
      notebooks: transformer(prevState.notebooks),
    }));
  };
  const setShortcuts: SetShortcuts = (transformer) => {
    console.log("setShortcuts()");
    setState((prevState) => ({
      ...prevState,
      shortcuts: transformer(prevState.shortcuts),
    }));
  };
  const setNotes: SetNotes = (transformer) => {
    setState((prevState) => ({
      ...prevState,
      notes: transformer(prevState.notes),
    }));
  };

  const execute: Execute = useCallback(
    async (name, input) => {
      const command = commands[name];
      if (command == null) {
        throw Error(`No command ${name} found.`);
      }

      await command(
        {
          setUI,
          setTags,
          setNotebooks,
          setShortcuts,
          setNotes,
          getState,
        },
        input as any
      );
    },
    [commands, getState]
  );

  return [state, execute, setUI];
}
