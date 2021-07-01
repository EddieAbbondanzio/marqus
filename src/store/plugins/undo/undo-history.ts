import { Queue } from '@/store/plugins/undo/queue';
import { UndoGroup, UndoHistoryEvent, UndoItem } from '@/store/plugins/undo/types';
import { MutationPayload } from 'vuex';
import { v4 as uuidv4 } from 'uuid';

/**
 * It's like a VCR but for mutations
 */
export class UndoHistory {
    activeGroups: { [id: string]: UndoGroup } = {};

    constructor(public events: UndoHistoryEvent[] = [], public currentIndex: number = -1) {
        if (currentIndex < -1 || currentIndex > events.length) {
            throw Error(`Current index ${currentIndex} out of range.`);
        }
    }

    /**
     * Add a new event to the history.
     * @param e The event to add.
     */
    push(e: UndoItem) {
        // Grouped mutation
        if (e.undoGroup != null) {
            const g = this.activeGroups[e.undoGroup];

            if (g == null) {
                throw Error(`No undo group ${e.undoGroup} found. Did you wrap the commit inside a undoGroup?`);
            }

            g.mutations.push(e);
        }
        // Normal mutation
        else {
            // Did we rewind and go off in a new direction? Wipe out no longer needed events.
            if (this.currentIndex >= 0 && this.events.length - 1 > this.currentIndex) {
                this.events.splice(this.currentIndex + 1);
            }

            this.events.push(e);
            this.currentIndex++;
        }
    }

    /**
     * Step back in time and move to the previous event.
     * @returns The event to undo.
     */
    rewind(): UndoHistoryEvent[] {
        if (!this.canRewind()) {
            throw Error('Nothing to rewind');
        }

        return this.events.slice(0, this.currentIndex--);
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
        return this.events.slice(0, ++this.currentIndex);
    }

    /**
     * Check if there are any remaining events to rewind.
     * @returns True if there are events in the history behind our current position.
     */
    canRewind() {
        return this.currentIndex >= 0;
    }

    /**
     * Check if there are any events ahead of our current spot.
     * @returns True if there are events ahead of our current position.
     */
    canFastForward() {
        return this.events.length > 0 && this.currentIndex < this.events.length - 1;
    }
    /**
     * Start a new group. Basically a unit of work, but for undo / redo.
     * @returns The id of the group being started.
     */
    startGroup(): string {
        const id = uuidv4();
        this.activeGroups[id] = { id, mutations: [] };

        return id;
    }
    /**
     * Finish off a group so no more mutations can be added.
     * @param id The id of the group to finish.
     */
    stopGroup(id: string) {
        if (this.activeGroups[id] == null) {
            throw Error(`No group with id ${id} to stop.`);
        }

        delete this.activeGroups[id];
    }
}
