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
  payload: TInput
) => Promise<void>;
