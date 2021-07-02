import { UndoGroup, UndoHistoryEvent, UndoItem } from '@/store/plugins/undo/types';
import { v4 as uuidv4 } from 'uuid';

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
    get events(): ReadonlyArray<UndoHistoryEvent> {
        return this._events;
    }

    /**
     * Create a new undo history.
     * @param _events The events that have occured.
     * @param _currentIndex The current position in the history.
     */
    constructor(private _events: UndoHistoryEvent[] = [], private _currentIndex = -1) {
        if (_currentIndex < -1 || _currentIndex > _events.length) {
            throw Error(`Current index ${_currentIndex} out of range.`);
        }
    }

    /**
     * Add a new event to the history.
     * @param e The event to add.
     */
    push(e: UndoItem) {
        // Grouped mutation
        if (e.undoGroup != null) {
            const g = this._activeGroups[e.undoGroup];

            if (g == null) {
                throw Error(`No undo group ${e.undoGroup} found. Did you wrap the commit inside a undoGroup?`);
            }

            g.mutations.push(e);
        }
        // Normal mutation
        else {
            // Did we rewind and go off in a new direction? Wipe out no longer needed events.
            if (this._currentIndex >= 0 && this._events.length - 1 > this._currentIndex) {
                this._events.splice(this._currentIndex + 1);
            }

            this._events.push(e);
            this._currentIndex++;
        }
    }

    /**
     * Step back in time and move to the previous event.
     * @returns The event to undo.
     */
    rewind(): UndoHistoryEvent[] {
        console.log(this.events);
        if (!this.canRewind()) {
            throw Error('Nothing to rewind');
        }
        const i = --this._currentIndex;
        return this._events.slice(0, i);
    }

    /**
     * Jump into the future, and move back to the next event.
     * @returns The event to apply.
     */
    fastForward(): UndoHistoryEvent[] {
        if (!this.canFastForward()) {
            throw Error('Nothing to fastforward');
        }

        // Pre-increment so we get the event ahead of our current position.
        return this._events.slice(0, ++this._currentIndex);
    }

    /**
     * Check if there are any remaining events to rewind.
     * @returns True if there are events in the history behind our current position.
     */
    canRewind() {
        return this._currentIndex >= 0;
    }

    /**
     * Check if there are any events ahead of our current spot.
     * @returns True if there are events ahead of our current position.
     */
    canFastForward() {
        return this._events.length > 0 && this._currentIndex < this._events.length - 1;
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
