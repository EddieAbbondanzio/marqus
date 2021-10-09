import { UndoHistory, UndoSequence, UndoSequenceCommit } from "@/store/plugins/undo/undo-history";
import { UndoStateCache } from "@/store/plugins/undo/undo-state-cache";
import _ from "lodash";
import { Store } from "vuex";
import { Mutations } from "vuex-smart-module";
import { Payload } from "vuex-smart-module/lib/assets";

export interface UndoModuleSettings {
    id?: string;
    name?: string;
    namespace: string;
    setStateAction?: string;
    /**
     * Transformer function that takes the state that will be set as the new vuex module
     * state and allows the caller to modify the state before it is assigned. Useful for
     * preserving visual changes that are not tracked in undo / redo so they aren't overwritten.
     */
    setStateTransformer?: (state: any) => any;
    stateCacheInterval?: number;
    ignore?: string[];
}

interface UndoModuleCommiter<M extends Mutations<any>> {
    (extCommit: () => void): UndoSequenceCommit;
    <K extends keyof M>(key: K, payload: Payload<M[K]>): UndoSequenceCommit;
}

/**
 * Module that retains it's own history state and handles undo / redo. Used in
 * conjunction with the undo plugin.
 */
export class UndoModule<M extends Mutations<any>> {
  get settings(): Readonly<UndoModuleSettings> {
    return this._settings;
  }

    /**
     * History cache of all the mutations / groups.
     */
    private _history: UndoHistory;

    /**
     * Cache of the modules states saved off at fixed intervals.
     */
    private _stateCache: UndoStateCache;

    constructor(private _getStore: () => Store<any>, private _settings: UndoModuleSettings) {
      this._history = new UndoHistory();
      this._stateCache = new UndoStateCache();

      this.tryRedo = this.tryRedo.bind(this);
      this.tryUndo = this.tryUndo.bind(this);
    }

    setInitialState(state: any) {
      console.log("set init state: ", state);
      this._stateCache.setInitialState(state);
    }

    sequence(cb: (commit: UndoModuleCommiter<M>) => void) {
      const seq = this._history.createSequence();

      const commit: UndoModuleCommiter<M> = (...args: any[]): UndoSequenceCommit => {
        let c;

        if (args.length === 1) {
          c = new UndoSequenceCommit(args[0]);
        } else {
          c = new UndoSequenceCommit(() => this._getStore().commit(args[0], args[1]));
        }

        seq.mutations.push(c);
        return c;
      };

      // Build it
      cb(commit);

      // Execute it
      seq.apply();
    }

    // /**
    //  * Add a new mutation to the history.
    //  * @param mutation The mutation to add to the history.
    //  */
    // push(mutation: MutationPayload) {
    //     // Skip if mutation has ignore flag set, or it's something we've already logged
    //     if (mutation.payload._undo?.ignore || mutation.payload._undo?.isReplay) {
    //         return;
    //     }

    //     this._history.push(mutation);

    //     /*
    //      * Cache off a recent copy of state as needed. Initial state is passed into the module constructor
    //      * because since we're working in a plugin we don't get to react until AFTER mutations are done. This
    //      * means if we tried to get initial state here, it would actually be the state after the first mutation.
    //      */
    //     if (this._history.currentIndex > 0 && this._history.currentIndex %
    // this._settings.stateCacheInterval! === 0) {
    //         const store = this._getStore();

    //         /*
    //          * We have to deep clone the state before caching otherwise we'll won't have a copy of the old data
    //          * since our reference will point to the current state that is being modified.
    //          */
    //         const state = getNamespacedState(store, this._settings.namespace);
    //         const clonedState = _.cloneDeep(state);

    //         this._stateCache.push(clonedState);
    //     }
    // }

    /**
     * Check if there is anything we can undo.
     * @returns True if the module has history that can be undone.
     */
    canUndo() {
      return this._history.canUndo();
    }

    /**
     * Check if there is anything we can redo.
     * @returns True if the module has history that can be redone.
     */
    canRedo() {
      return this._history.canRedo();
    }

    async tryUndo() {
      if (this.canUndo()) this.undo();
    }

    async tryRedo() {
      if (this.canRedo()) this.redo();
    }

    /**
     * Undo the last mutation, or group. Throws if none.
     */
    async undo() {
      // console.log('history: ', this._history);
      // Roll back to most recently cached state
      const cached = this._stateCache.getLast(this._history.currentIndex);
      const store = this._getStore();

      let state = cached.state;
      if (this._settings.setStateTransformer != null) {
        state = this._settings.setStateTransformer(state);

        if (state == null) {
          throw Error("No state returned from set state transformer. Did you forget to return the state?");
        }
      }

      store.commit(`${this._settings.namespace}/${this._settings.setStateAction}`, state);

      // Reapply (N - 1) mutations to get to the desired state.
      const [replay, undone] = this._history.undo(cached.index, this._history.currentIndex - 1);

      console.log("replay: ", replay);
      console.log("undone: ", undone);
      // await this._replayMutations(replay, 'undo');
      // await this._notifyCallbacks(undone, 'undo');
    }

    /**
     * Redo the last undone mutation or group. Throws if none.
     */
    async redo() {
      const mutation = this._history.redo();
      // await this._replayMutations([mutation], 'redo');
      // await this._notifyCallbacks(mutation, 'redo');
    }

    /**
     * Create a new undo group that bunches multiple commits into one undo.
     * @param handle The callback that will contain the commits of the group.
     */
    // async group(handle: (_undo: UndoMetadata) => any) {
    // const groupId = this._history.startGroup();
    // const metaData: UndoMetadata = { group: { id: groupId, namespace: this.settings.namespace }, cache: {} };
    // // Handles can be async, or sync because not all actions will be async
    // if (isAsync(handle)) {
    //     await handle(metaData);
    // } else {
    //     handle(metaData);
    // }
    // this._history.stopGroup(groupId);
    // }

    /**
     * Set a hardlimit that the user cannot undo past. Can only be removed by calling
     * releaseHardLimit().
     */
    setRollbackPoint() {
      this._history.setRollbackPoint();
    }

    /**
     * Release a hard limit so the user can undo beyond it.
     */
    releaseRollbackPoint() {
      this._history.releaseRollbackPoint();
    }

    /**
     * Reverts all commits plus the one right before the hard limit to revert
     * app state to back before anything happened.
     */
    async rollback() {
      if (this._history.hardLimit == null) {
        return;
      }

      if (!this.canUndo()) {
        return;
      }

      // Roll back to most recently cached state
      // console.log('hard stop at: ', this._history.hardLimit, ' curr index: ', this._history.currentIndex);
      const cached = this._stateCache.getLast(this._history.hardLimit);
      const store = this._getStore();

      let state = cached.state;
      if (this._settings.setStateTransformer != null) {
        state = this._settings.setStateTransformer(state);

        if (state == null) {
          throw Error("No state returned from set state transformer. Did you forget to return the state?");
        }
      }

      store.commit(`${this._settings.namespace}/${this._settings.setStateAction}`, state);

      // Reapply (N - 1) mutations to get to the desired state.
      // console.log('undo start index: ', cached.index, ' undo stop index: ', this._history.hardLimit - 1);
      const [replay, undone] = this._history.undo(cached.index, this._history.hardLimit - 1);

      // console.log('replay: ', replay);
      // console.log('undone: ', undone);
      // await this._replayMutations(replay, 'undo');
      // await this._notifyCallbacks(undone, 'undo');

      this._history.releaseRollbackPoint();
      // console.log('rolledback complete!');
    }

    /**
     * Replay the mutations in the order they came in.
     * @param mutations The mutations to reapply.
     * @param mode If the replay is an undo, or redo.
     */
    private async _replayMutations(mutations: UndoSequence[]) {
      const store = this._getStore();

      // for (const event of mutations) {
      //     if (isUndoGroup(event)) {
      //         for (const mutation of event.mutations) {
      //             const [mutationNamespace] = splitMutationAndNamespace(mutation.type);

      //             // Skip external grouped mutations.
      //             if (mutationNamespace !== this._settings.namespace) {
      //                 continue;
      //             }

      //             store.commit(mutation.type, mutation.payload);
      //         }
      //     } else {
      //         store.commit(event.type, event.payload);
      //     }
      // }
    }

    /**
     * Notify the undo / redo callback of a mutation depending on the mode.
     * @param mutation The mutation to notify callbacks of.
     * @param mode If the replay is an undo, or redo.
     */
    private async _notifyCallbacks(mutation: UndoSequence) {
      // const mutations = isUndoGroup(mutation) ? mutation.mutations : [mutation];
      // for (const m of mutations) {
      //     const metadata = m.payload._undo as UndoMetadata;
      //     let callback;
      //     // Stop if no metadata
      //     if (metadata == null) {
      //         return;
      //     }
      //     switch (mode) {
      //         case 'redo':
      //             callback = metadata.redoCallback;
      //             break;
      //         case 'undo':
      //             callback = metadata.undoCallback;
      //             break;
      //     }
      //     if (callback != null) {
      //         const ctx = new UndoContext(m, this._getStore());
      //         if (isAsync(callback)) {
      //             await callback(ctx);
      //         } else {
      //             callback(ctx);
      //         }
      //     }
      // }
    }
}