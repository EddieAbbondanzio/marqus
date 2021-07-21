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
        e.payload.undo ??= {};

        // Grouped mutation
        if (e.payload.undo.groupId != null) {
            const g = this._activeGroups[e.payload.undo.groupId];

            if (g == null) {
                throw Error(`No undo group ${e.payload.undo.groupId} found. Did you wrap the commit inside a undoGroup?`);
            }

            g.mutations.push(e);

            // On first mutation added, add it to the event history
            if (g.mutations.length === 1) {
                this._events.push(g);
                this._currentIndex++;
            }
        // eslint-disable-next-line
        }
        // Normal mutation
        else {
            // Did we rewind?
            if (this._events.length > this._currentIndex) {
                // Edge case of changing directions. IE undid 1 or more mutations, and then proceeded to add new mutations
                if (!e.payload.undo.isReplay) {
                    this._events = [...this._events.slice(0, this.currentIndex), e];
                    this._currentIndex = this._events.length;
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
     * @param index The index to jump back to
     * @returns The event to undo.
     */
    undo(index: number): [replay: UndoItemOrGroup[], undone: UndoItemOrGroup] {
        if (!this.canUndo()) {
            throw Error('Nothing to undo');
        }

        const toReplay = this._events.slice(index, this.currentIndex - 1);
        const undone = this._events[this.currentIndex];

        for (const mutation of toReplay) {
            if (isUndoGroup(mutation)) {
                mutation.mutations.forEach(m => (m.payload.undo = { isReplay: true } as UndoMetadata));
            } else {
                mutation.payload.undo ??= {};
                mutation.payload.undo.isReplay = true;
            }
        }

        // Jump back to what we rewinded to before
        this._currentIndex = index;

        return [toReplay, undone];
    }

    /**
     * Jump into the future, and move back to the next event.
     * @returns The event to apply.
     */
    redo(): UndoItemOrGroup {
        if (!this.canRedo()) {
            throw Error('Nothing to redo');
        }
        // Pre-increment so we get the event ahead of our current position.
        const nextIndex = this._currentIndex;
        const toReplay = this._events[nextIndex];

        if (isUndoGroup(toReplay)) {
            toReplay.mutations.forEach(m => (m.payload.undo = { isReplay: true } as UndoMetadata));
        } else {
            toReplay.payload.undo ??= {};
            toReplay.payload.undo.isReplay = true;
        }

        return toReplay;
    }

    /**
     * Check if there are any remaining events to rewind.
     * @returns True if there are events in the history behind our current position.
     */
    canUndo() {
        return this._currentIndex > 0;
    }

    /**
     * Check if there are any events ahead of our current spot.
     * @returns True if there are events ahead of our current position.
     */
    canRedo() {
        return this._events.length > 0 && this._currentIndex < this._events.length;
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
