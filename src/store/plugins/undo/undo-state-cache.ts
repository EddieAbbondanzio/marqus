/**
 * Fixed interval cache for storing previous store states.
 */
export class UndoStateCache {
    private _cache: Map<number, any>;

    constructor(initialState: any, public readonly interval: number = 100) {
        this._cache = new Map();
        this._cache.set(0, initialState);
    }

    /**
     * Cache another state.
     * @param state The next state to cache.
     */
    push(state: any) {
        const nextIndex = this.calculateNextIndex();
        this._cache.set(nextIndex, state);
    }

    /**
     * Get the closest cached state based on the index passed.
     * @param index The index to base it off.
     * @returns The closest previously cached state.
     */
    getLast(index: number): any {
        const lastIndex = this.calculateLast(index);
        return this._cache.get(lastIndex);
    }

    /**
     * Delete any cached states after the passed index.
     * @param index The index to delete after.
     */
    deleteAfter(index: number) {
        for (const [key] of this._cache) {
            if (key > index) {
                this._cache.delete(key);
            }
        }
    }

    /**
     * Custom JSON.stringify serialization.
     * @returns The entries within the cache
     */
    toJSON() {
        return this._cache.entries();
    }

    /**
     * Calculate the next index to cache at.
     * @returns The next index to be cached at.
     */
    private calculateNextIndex() {
        // Since we start at 0, size is already +1
        return this._cache.size * this.interval;
    }

    /**
     * Calculate the last state cache index relative to the index passed.
     * @param index The index to calculate from.
     * @returns The closest index of previously cached state.
     */
    private calculateLast(index: number) {
        return index - (index % this.interval);
    }
}
