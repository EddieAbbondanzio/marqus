import {
  Dispatch,
  Reducer,
  ReducerState,
  useCallback,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { State } from "../../../shared/state";
import { appCommands } from "./appCommands";
import { CommandRegistry } from "./types";

export const commands: CommandRegistry = {
  ...appCommands,
};

export type Execute = <
  Command extends keyof typeof commands,
  Payload extends typeof commands[Command]
>(
  command: Command,
  payload?: Payload
) => Promise<void>;

export function useCommands(initialState: State): [State, Execute] {
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

  return [state, execute];
}

export type ConfirmOrCancel = [
  /**
   * Callback to trigger when user wishes to save input
   */
  confirm: (value: string) => void,
  /**
   * Callback to trigger when the user wants to cancel input
   */
  cancel: () => void,
  /**
   * Awaitable promise that is resolved upon confirm or cancel.
   */
  response: Promise<[outcome: "confirm" | "cancel", value?: string]>
];

/**
 * Helper to await user input that can be categorized as yay or nay.
 * Useful for performing finalizing actions such as creating resources
 * when a user confirms it, or reverting state if they wish to cancel.
 */
export function createConfirmOrCancel(): ConfirmOrCancel {
  let confirm: (value: string) => void;
  let cancel: () => void;

  let confirmPromise: Promise<["confirm", string]> = new Promise(
    (res) => (confirm = (v) => res(["confirm", v]))
  );
  let cancelPromise: Promise<["cancel"]> = new Promise(
    (res) => (cancel = () => res(["cancel"]))
  );

  return [confirm!, cancel!, Promise.race([confirmPromise, cancelPromise])];
}
