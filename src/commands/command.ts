/*
 * This class cannot be in index.ts otherwise we introduce a circular dependency.
 */

/**
 * Base class for a command handler to implement.
 */
export abstract class Command<TInput> {
    abstract execute(payload: TInput): Promise<void>;
}
