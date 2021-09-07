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

    hardLimit?: number;

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
        const metadata = e.payload._undo as UndoMetadata;

        if (metadata.ignore) {
            return;
        }

        // console.log('push: ', e);

        // Grouped mutation
        if (metadata.group != null) {
            if (metadata.isReplay) {
                return;
            }

            const g = this._activeGroups[metadata.group.id];

            if (g == null) {
                throw Error(`No undo group ${metadata.group.id} found. Did you wrap the commit inside a undoGroup?`);
            }

            // console.log('added to group ', g);
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
                if (!metadata.isReplay) {
                    this._events = [...this._events.slice(0, this.currentIndex), e];
                    this._currentIndex = this._events.length;
                } else {
                    this._currentIndex++;
                }
            } else {
                this._events.push(e);
                this._currentIndex++;
            }

            // console.log('added to history')
        }
    }

    /**
     * Step back in time and move to the previous event.
     * @param index The index to jump back to
     * @returns The event to undo.
     */
    undo(replayStartIndex: number, stopIndex: number): [replay: UndoItemOrGroup[], undone: UndoItemOrGroup] {
        // console.log('curr index: ', this._currentIndex, ' jump back to: ', replayStartIndex, ' but stop at: ', stopIndex)
        if (!this.canUndo()) {
            throw Error('Nothing to undo');
        }

        const toReplay = this._events.slice(replayStartIndex, stopIndex);
        const undone = this._events[stopIndex]; // Intentional. We don't want to return them all.

        for (const mutation of toReplay) {
            if (isUndoGroup(mutation)) {
                mutation.mutations.forEach(m => (m.payload._undo.isReplay = true));
            } else {
                mutation.payload._undo ??= {};
                mutation.payload._undo.isReplay = true;
            }
        }

        // Jump back to what we rewinded to before
        this._currentIndex = stopIndex;

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
        const toReplay = this._events[this._currentIndex];

        if (isUndoGroup(toReplay)) {
            toReplay.mutations.forEach(m => (m.payload._undo.isReplay = true));
        } else {
            toReplay.payload._undo ??= {};
            toReplay.payload._undo.isReplay = true;
        }

        this._currentIndex++;

        // console.log(`Redo! curr index: ${this._currentIndex}, max index: ${this._events.length}`)
        return toReplay;
    }

    /**
     * Check if there are any remaining events to rewind.
     * @returns True if there are events in the history behind our current position.
     */
    canUndo() {
        if (this.hardLimit != null) {
            return this._currentIndex > 0 && this.hardLimit < this._currentIndex; 
        }

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

    /**
     * Set a hard limit in the history that will prevent the user from undo-ing too much.
     * Useful for when we need to track some local input but prevent the user from holding
     * control-z too long and accidentallly wiping out stuff.
     */
    setCheckpoint() {
        this.hardLimit = this.currentIndex;
    }

    /**
     * Release the hard limit. (Deletes it).
     */
    releaseCheckpoint() {
        delete this.hardLimit;
    }
}
