import { isUndoGroup, UndoHistoryEvent, UndoModuleSettings } from '@/store/plugins/undo/types';
import { UndoHistory } from '@/store/plugins/undo/undo-history';
import { UndoStateCache } from '@/store/plugins/undo/undo-state-cache';
import { MutationPayload, Store } from 'vuex';

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

    constructor(initialState: any, private _store: () => Store<any>, private _settings: UndoModuleSettings) {
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

        this._history.push(mutation);

        // Update state cache if needed.
        if (this._history.currentIndex % this._settings.stateCacheInterval === 0) {
            this._stateCache.push(this._store().state[this._settings.namespace]);
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
        const closestCachedState = this._stateCache.getLast(this._history.currentIndex);
        console.log('cached state was: ', closestCachedState);
        this._store().commit(`${this._settings.namespace}/${this._settings.setStateMutation}`, closestCachedState);

        const mutations = this._history.rewind();
        this.replayMutations(mutations);
    }

    /**
     * Redo the last undone mutation or group. Throws if none.
     */
    redo() {
        const mutations = this._history.fastForward();
        this.replayMutations(mutations);
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
    private replayMutations(mutations: UndoHistoryEvent[]) {
        for (const event of mutations) {
            if (isUndoGroup(event)) {
                for (const mutation of event.mutations) {
                    this._store().commit(mutation.payload.type, mutation.payload.payload);
                }
            } else {
                this._store().commit(event.type, event.payload.payload);
            }
        }
    }
}