import {
    isUndoGroup,
    UndoItemOrGroup,
    UndoMetadata,
    UndoContextSettings,
    UndoReplayMode
} from '@/store/plugins/undo/types';
import { UndoHistory } from '@/store/plugins/undo/undo-history';
import { UndoStateCache } from '@/store/plugins/undo/undo-state-cache';
import { MutationPayload, Store } from 'vuex';
import { getNamespacedState } from '@/store/common/utils/get-namespaced-state';
import _ from 'lodash';
import { isAsync } from '@/shared/utils/is-async';
import { splitMutationAndNamespace } from '@/store/common/utils/split-mutation-and-namespace';

/**
 * Module that retains it's own history state and handles undo / redo. Used in
 * conjunction with the undo plugin.
 */
export class UndoContext {
    get settings(): Readonly<UndoContextSettings> {
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

    constructor(initialState: any, private _getStore: () => Store<any>, private _settings: UndoContextSettings) {
        this._history = new UndoHistory();
        this._stateCache = new UndoStateCache(initialState);
        this.group = this.group.bind(this);

        this.tryRedo = this.tryRedo.bind(this);
        this.tryUndo = this.tryUndo.bind(this);
    }

    /**
     * Add a new mutation to the history.
     * @param mutation The mutation to add to the history.
     */
    push(mutation: MutationPayload) {
        // Skip if mutation has ignore flag set, or it's something we've already logged
        if (mutation.payload._undo?.ignore || mutation.payload._undo?.isReplay) {
            return;
        }

        this._history.push(mutation);

        /*
         * Cache off a recent copy of state as needed. Initial state is passed into the module constructor
         * because since we're working in a plugin we don't get to react until AFTER mutations are done. This
         * means if we tried to get initial state here, it would actually be the state after the first mutation.
         */
        if (this._history.currentIndex > 0 && this._history.currentIndex % this._settings.stateCacheInterval! === 0) {
            const store = this._getStore();

            /*
             * We have to deep clone the state before caching otherwise we'll won't have a copy of the old data
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
        console.log(this);
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

        store.commit(`${this._settings.namespace}/${this._settings.setStateMutation}`, cached.state);

        // Reapply (N - 1) mutations to get to the desired state.
        const [replay, undone] = this._history.undo(cached.index, this._history.currentIndex - 1);

        // console.log('replay: ', replay);
        // console.log('undone: ', undone);
        await this._replayMutations(replay, 'undo');
        await this._notifyCallbacks(undone, 'undo');
    }

    /**
     * Redo the last undone mutation or group. Throws if none.
     */
    async redo() {
        const mutation = this._history.redo();
        await this._replayMutations([mutation], 'redo');
        await this._notifyCallbacks(mutation, 'redo');
    }

    /**
     * Create a new undo group that bunches multiple commits into one undo.
     * @param handle The callback that will contain the commits of the group.
     */
    async group(handle: (_undo: UndoMetadata) => any) {
        const groupId = this._history.startGroup();
        const metaData: UndoMetadata = { group: { id: groupId, namespace: this.settings.namespace }, cache: {} };

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
                    const [mutationNamespace] = splitMutationAndNamespace(mutation.type);

                    // Skip external grouped mutations.
                    if (mutationNamespace !== this._settings.namespace) {
                        continue;
                    }

                    store.commit(mutation.type, mutation.payload);
                }
            } else {
                store.commit(event.type, event.payload);
            }
        }
    }

    /**
     * Notify the undo / redo callback of a mutation depending on the mode.
     * @param mutation The mutation to notify callbacks of.
     * @param mode If the replay is an undo, or redo.
     */
    private async _notifyCallbacks(mutation: UndoItemOrGroup, mode: UndoReplayMode) {
        const mutations = isUndoGroup(mutation) ? mutation.mutations : [mutation];

        for (const m of mutations) {
            const metadata = m.payload._undo as UndoMetadata;
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
                    await callback(m);
                } else {
                    callback(m);
                }
            }
        }
    }
}

export type UndoGrouper = UndoContext['group'];
