/*
 * These types cannot be in index.ts otherwise we introduce a circular dependency.
 */

import { AppState } from "../ui/appState";

export interface CommandContext {
  state: AppState;
  commit(newState: AppState): Promise<void>;
  rollback(): Promise<void>;
}

export type Command<TInput = void> = (
  context: CommandContext,
  // Payload is nullable because we can't pass parameters
  // when invoking via a shortcut
  payload?: TInput
) => Promise<void>;
