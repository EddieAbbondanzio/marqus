// import _ from "lodash";

// /**
//  * Fixed interval cache for storing previous store states.
//  */
// export class UndoStateCache {
//     static readonly DEFAULT_INTERVAL = 100;

//     get cache(): ReadonlyMap<number, any> {
//       return this._cache;
//     }

//     private _cache: Map<number, any>;

//     constructor(public readonly interval: number = UndoStateCache.DEFAULT_INTERVAL) {
//       this._cache = new Map();
//     }

//     setInitialState(state: any) {
//       if (this._cache.entries.length > 0) {
//         throw Error("Cannot set initial state as cache already contains entries");
//       }

//       const cloned = _.cloneDeep(state);
//       this._cache.set(0, cloned);
//     }

//     /**
//      * Cache another state.
//      * @param state The next state to cache.
//      */
//     push(state: any) {
//       const nextIndex = this._calculateNextIndex();
//       const cloned = _.cloneDeep(state);

//       this._cache.set(nextIndex, cloned);
//     }

//     /**
//      * Get the closest cached state based on the index passed.
//      * @param index The index to base it off.
//      * @returns The closest previously cached state.
//      */
//     getLast(index: number): { state: any; index: number } {
//       const lastIndex = this._calculateLastRelativeTo(index);

//       const oldState = this._cache.get(lastIndex);
//       const cloned = _.cloneDeep(oldState);

//       return { state: cloned, index: lastIndex };
//     }

//     /**
//      * Delete any cached states after the passed index.
//      * @param index The index to delete after.
//      */
//     deleteAfter(index: number) {
//       for (const [key] of this._cache) {
//         if (key > index) {
//           this._cache.delete(key);
//         }
//       }
//     }

//     /**
//      * Calculate the next index to cache at.
//      * @returns The next index to be cached at.
//      */
//     private _calculateNextIndex() {
//       // Since we start at 0, size is already +1
//       return this._cache.size * this.interval;
//     }

//     /**
//      * Calculate the last state cache index relative to the index passed.
//      * @param index The index to calculate from.
//      * @returns The closest index of previously cached state.
//      */
//     private _calculateLastRelativeTo(index: number) {
//       return index - (index % this.interval);
//     }
// }
