import { UndoGroup, UndoItemOrGroup, isUndoGroup, UndoMetadata } from '@/store/plugins/undo/types';
import { v4 as uuidv4 } from 'uuid';
import { MutationPayload } from 'vuex';

/**
 * It's like a VCR but for mutations
 */
export class UndoHistory {
    private _activeGroups: { [id: string]: UndoGroup } = {};

    /**
     * Readonly access of the current index
     */
    get currentIndex(): number {
        return this._currentIndex;
    }

    /**
     * Readonly access of the underlying events.
     * (Can still be modified if not careful)
     */
    get events(): ReadonlyArray<UndoItemOrGroup> {
        return this._events;
    }

    /**
     * Create a new undo history.
     * @param _events The events that have occured.
     * @param _currentIndex The current position in the history.
     */
    constructor(private _events: UndoItemOrGroup[] = [], private _currentIndex = 0) {
        if (_currentIndex < 0 || _currentIndex > _events.length) {
            throw Error(`Current index ${_currentIndex} out of range.`);
        }
    }

    /**
     * Add a new event to the history.
     * @param e The event to add.
     */
    push(e: MutationPayload) {
        // Populate empty metadata in case it's missing. Not really needed, but makes our life easier.
        e.payload._undo ??= {};

        // Grouped mutation
        if (e.payload._undo.groupId != null) {
            const g = this._activeGroups[e.payload._undo.groupId];

            if (g == null) {
                throw Error(`No undo group ${e.payload._undo.groupId} found. Did you wrap the commit inside a undoGroup?`);
            }

            g.mutations.push(e);
        }
        // Normal mutation
        else {
            // Did we rewind?
            if (this._events.length > this._currentIndex) {
                if (!e.payload._undo.isReplay) {
                    this._events.splice(this.currentIndex + 1);
                } else {
                    this._currentIndex++;
                }
            } else {
                    this._events.push(e);
                    this._currentIndex++;
                }
            }
    }

    /**
     * Step back in time and move to the previous event.
     * @returns The event to undo.
     */
    rewind(index: number): UndoItemOrGroup[] {
        if (!this.canRewind()) {
            throw Error('Nothing to rewind');
        }
        const toReplay = this._events.slice(index, this.currentIndex - 1);

        for (const mutation of toReplay) {
            if (isUndoGroup(mutation)) {
                mutation.mutations.forEach(m => (m.payload._undo = { isReplay: true } as UndoMetadata));
            } else {
                mutation.payload._undo ??= {};
                mutation.payload._undo.isReplay = true;
            }
        }

        // Jump back to what we rewinded to before
        this._currentIndex = index;

        return toReplay;
    }

    /**
     * Jump into the future, and move back to the next event.
     * @returns The event to apply.
     */
    fastForward(): UndoItemOrGroup {
        if (!this.canFastForward()) {
            throw Error('Nothing to fastforward');
        }
        // Pre-increment so we get the event ahead of our current position.
        const nextIndex = this._currentIndex + 1;
        const toReplay = this._events[nextIndex];

        if (isUndoGroup(toReplay)) {
            toReplay.mutations.forEach(m => (m.payload._undo = { isReplay: true } as UndoMetadata));
        } else {
            toReplay.payload._undo ??= {};
            toReplay.payload._undo.isReplay = true;
        }

        return toReplay;
    }

    /**
     * Check if there are any remaining events to rewind.
     * @returns True if there are events in the history behind our current position.
     */
    canRewind() {
        return this._currentIndex > 0;
    }

    /**
     * Check if there are any events ahead of our current spot.
     * @returns True if there are events ahead of our current position.
     */
    canFastForward() {
        return this._events.length > 0 && this._currentIndex + 1 < this._events.length;
    }

    /**
     * Start a new group. Basically a unit of work, but for undo / redo.
     * @returns The id of the group being started.
     */
    startGroup(): string {
        const id = uuidv4();
        this._activeGroups[id] = { id, mutations: [] };

        return id;
    }

    /**
     * Finish off a group so no more mutations can be added.
     * @param id The id of the group to finish.
     */
    stopGroup(id: string) {
        if (this._activeGroups[id] == null) {
            throw Error(`No group with id ${id} to stop.`);
        }

        delete this._activeGroups[id];
    }
}
