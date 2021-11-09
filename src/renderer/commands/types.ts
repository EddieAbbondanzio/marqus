/*
 * These types cannot be in index.ts otherwise we introduce a circular dependency.
 */

import { AppState } from "../ui/appState";

export type Command<TInput = void> = (
  state: AppState,
  payload: TInput
) => Promise<void>;
