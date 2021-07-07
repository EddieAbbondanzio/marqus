import {
    isUndoGroup,
    UndoItemOrGroup,
    UndoMetadata,
    UndoModuleSettings,
    UndoReplayMode
} from '@/store/plugins/undo/types';
import { UndoHistory } from '@/store/plugins/undo/undo-history';
import { UndoStateCache } from '@/store/plugins/undo/undo-state-cache';
import { MutationPayload, Store } from 'vuex';
import { v4 as uuidv4 } from 'uuid';
import { getNamespacedState } from '@/store/utils/get-namespaced-state';
import _ from 'lodash';
import { isAsync } from '@/utils/is-async';

/**
 * Module that retains it's own history state and handles undo / redo. Used in
 * conjunction with the undo plugin.
 */
export class UndoModule {
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

    constructor(initialState: any, private _getStore: () => Store<any>, private _settings: UndoModuleSettings) {
        this._history = new UndoHistory();
        this._stateCache = new UndoStateCache(initialState);
    }

    /**
     * Add a new mutation to the history.
     * @param mutation The mutation to add to the history.
     */
    push(mutation: MutationPayload) {
        this._history.push(mutation);

        /*
         * Cache off a recent copy of state as needed. Initial state is passed into the module constructor
         * because since we're working in a plugin we don't get to react until AFTER mutations are done. This
         * means if we tried to get initial state here, it would actually be the state after the first mutation.
         */
        if (this._history.currentIndex > 0 && this._history.currentIndex % this._settings.stateCacheInterval === 0) {
            const store = this._getStore();

            /*
             * We have to deep clone the state to cache otherwise we'll won't have a copy of the old data
             * since our reference will point to the current state that is being modified.
             */
            const state = getNamespacedState(store, this._settings.namespace);
            const clonedState = _.cloneDeep(state);

            this._stateCache.push(clonedState);
        }
    }

    /**
     * Check if there is anything we can undo.
     * @returns True if the module has history that can be undone.
     */
    canUndo() {
        return this._history.canRewind();
    }

    /**
     * Check if there is anything we can redo.
     * @returns True if the module has history that can be redone.
     */
    canRedo() {
        return this._history.canFastForward();
    }

    /**
     * Undo the last mutation, or group. Throws if none.
     */
    async undo() {
        // Roll back to most recently cached state
        const cached = this._stateCache.getLast(this._history.currentIndex);
        const store = this._getStore();
        store.commit(`${this._settings.namespace}/${this._settings.setStateMutation}`, cached.state);

        // Reapply (N - 1) mutations to get to the desired state.
        const mutations = this._history.rewind(cached.index);
        await this._replayMutations(mutations, 'undo');
    }

    /**
     * Redo the last undone mutation or group. Throws if none.
     */
    async redo() {
        const mutation = this._history.fastForward();
        await this._replayMutations([mutation], 'redo');
    }

    /**
     * Create a new undo group that bunches multiple commits into one undo.
     * @param handle The callback that will contain the commits of the group.
     */
    async group(handle: (undo: UndoMetadata) => any) {
        const groupId = this._history.startGroup();
        const metaData: UndoMetadata = { groupId };

        // Handles can be async, or sync because not all actions will be async
        if (isAsync(handle)) {
            await handle(metaData);
        } else {
            handle(metaData);
        }

        this._history.stopGroup(groupId);
    }

    /**
     * Replay the mutations in the order they came in.
     * @param mutations The mutations to reapply.
     * @param mode If the replay is an undo, or redo.
     */
    private async _replayMutations(mutations: UndoItemOrGroup[], mode: UndoReplayMode) {
        const store = this._getStore();

        for (const event of mutations) {
            if (isUndoGroup(event)) {
                for (const mutation of event.mutations) {
                    store.commit(mutation.type, mutation.payload);
                    await this._notifyCallbacks(mutation, mode);
                }
            } else {
                store.commit(event.type, event.payload);
                await this._notifyCallbacks(event, mode);
            }
        }
    }

    /**
     * Notify the undo / redo callback of a mutation depending on the mode.
     * @param mutation The mutation to notify callbacks of.
     * @param mode If the replay is an undo, or redo.
     */
    private async _notifyCallbacks(mutation: MutationPayload, mode: UndoReplayMode) {
        const metadata = mutation.payload.undo as UndoMetadata;
        let callback;

        // Stop if no metadata
        if (metadata == null) {
            return;
        }

        switch (mode) {
            case 'redo':
                callback = metadata.redoCallback;
                break;

            case 'undo':
                callback = metadata.undoCallback;
                break;
        }

        if (callback != null) {
            if (isAsync(callback)) {
                await callback(mutation);
            } else {
                callback(mutation);
            }
        }
    }
}
