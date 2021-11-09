/*
 * These types cannot be in index.ts otherwise we introduce a circular dependency.
 */

export type Command<TInput = void> = (payload: TInput) => Promise<void>;
