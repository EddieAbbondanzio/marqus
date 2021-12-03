import { chain, last } from "lodash";
import {
  Dispatch,
  Reducer,
  ReducerState,
  useCallback,
  useLayoutEffect,
  useReducer,
  useRef,
} from "react";
import { State } from "../../shared/state";

export type Action<Type extends string, Props = {}> = {
  [Property in keyof Props]: Props[Property];
} & { type: Type };

export interface ExecutionContext {
  dispatch: Dispatch<Action<any>>;
  getState: () => State;
}

export type Command<Input = void> = (
  context: ExecutionContext,
  // Payload is optional to support running as a shortcut
  payload?: Input
) => Promise<void>;

export type CommandRegistry = Record<string, Command<any>>;

/**
 * Prefix a namespace to every property name delimited via a period.
 */
export type Namespaced<N extends string, T> = {
  [K in Extract<keyof T, string> as `${N}.${K}`]: T[K];
};

export type Execute<
  CR extends CommandRegistry,
  CT extends keyof CR = keyof CR
> = (type: CT, arg?: Parameters<CR[CT]>[1]) => void;

/**
 * Add a namespace to the front of every command. { foo: Command } => { namespace.foo: Command }
 * @param namespace The namespace to prefix to the commands.
 * @param registry The command registry to map
 * @returns The newly namespaced commands
 */
export const namespace = <N extends string, R extends CommandRegistry>(
  namespace: N,
  registry: R
): Namespaced<N, R> =>
  chain(registry)
    .entries()
    .map(([key, command]) => [`${namespace}.${key}`, command])
    .fromPairs()
    .value() as Namespaced<N, R>;

export function useCommands<
  R extends Reducer<any, any>,
  CR extends CommandRegistry,
  S extends ReducerState<R>
>(reducer: R, registry: CR, initialState: S): [S, Execute<CR>] {
  // Sampled: https://github.com/dai-shi/use-reducer-async/blob/main/src/index.ts

  const [state, dispatch] = useReducer(reducer, initialState);
  const lastState = useRef(state);
  useLayoutEffect(() => {
    lastState.current = state;
  }, [state]);
  const getState = useCallback(() => lastState.current, []);

  const execute: Execute<CR> = useCallback(
    async (command, input) => {
      const handler = registry[command];

      if (handler == null) {
        throw Error(`No command ${command} found.`);
      }

      await handler({ dispatch, getState }, input);
    },
    [registry, getState]
  );

  return [state, execute];
}
