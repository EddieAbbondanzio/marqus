import { isUndoGroup, UndoItemOrGroup, UndoModuleSettings } from '@/store/plugins/undo/types';
import { UndoHistory } from '@/store/plugins/undo/undo-history';
import { UndoStateCache } from '@/store/plugins/undo/undo-state-cache';
import { MutationPayload, Store } from 'vuex';
import { v4 as uuidv4 } from 'uuid';

/**
 * Module that retains it's own history state and handles undo / redo. Used in
 * conjunction with the undo plugin.
 */
export class UndoModule {
    get settings(): Readonly<UndoModuleSettings> {
        return this._settings;
    }

    /**
     * Getter so we can access the vuex store
     */
    private _getStore: () => Store<any>;

    /**
     * History cache of all the mutations / groups.
     */
    private _history: UndoHistory;

    /**
     * Cache of the modules states saved off at fixed intervals.
     */
    private _stateCache: UndoStateCache;

    constructor(initialState: any, getStore: () => Store<any>, private _settings: UndoModuleSettings) {
        this._getStore = getStore;
        this._history = new UndoHistory();
        this._stateCache = new UndoStateCache(initialState);
    }

    /**
     * Add a new mutation to the history.
     * @param mutation The mutation to add to the history.
     */
    push(mutation: MutationPayload) {
        // Check to see if we need to purge the cache of state that is no longer needed. IE undo and change directions.
        if (this._history.canFastForward()) {
            this._stateCache.deleteAfter(this._history.currentIndex);
        }

        // If this is a mutation we haven't seen before, give it an id for easier comparison later on.
        this._history.push(mutation);

        // Update state cache if needed.
        if (this._history.currentIndex % this._settings.stateCacheInterval === 0) {
            const store = this._getStore();
            this._stateCache.push(store.state[this._settings.namespace]);
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
    undo() {
        const cached = this._stateCache.getLast(this._history.currentIndex);
        const store = this._getStore();
        store.commit(`${this._settings.namespace}/${this._settings.setStateMutation}`, cached.state);

        const mutations = this._history.rewind(cached.index);
        this.replayMutations(mutations);
    }

    /**
     * Redo the last undone mutation or group. Throws if none.
     */
    redo() {
        const mutation = this._history.fastForward();
        this.replayMutations([mutation]);
    }

    /**
     * Start a new mutation group. A mutation group is a unit of work that will be undone,
     * redone all at once.
     * @returns The id of the newly created mutation group.
     */
    startGroup(): string {
        return this._history.startGroup();
    }

    /**
     * Stop an undo mutation group so no more mutations can be added to it.
     * @param id The id of the active mutation group to finalize
     */
    stopGroup(id: string) {
        this._history.stopGroup(id);
    }

    /**
     * Replay the mutations in the order they came in.
     * @param mutations The mutations to reapply.
     */
    private replayMutations(mutations: UndoItemOrGroup[]) {
        const store = this._getStore();

        for (const event of mutations) {
            if (isUndoGroup(event)) {
                for (const mutation of event.mutations) {
                    store.commit(mutation.type, mutation.payload);
                }
            } else {
                store.commit(event.type, event.payload);
            }
        }
    }
}
