/*
 * These types cannot be in index.ts otherwise we introduce a circular dependency.
 */

import { State } from "../../shared/state";

export interface CommandContext {
  state: State;
  commit(newState: State): Promise<void>;
  rollback(): Promise<void>;
}

export type Reducer<State, Input> = (
  state: State,
  input: Input
) => State | Promise<State>;

export type Command<Input = void> = (
  context: CommandContext,
  // Payload is nullable because we can't pass parameters
  // when invoking via a shortcut
  payload?: Input
) => Promise<void>;
