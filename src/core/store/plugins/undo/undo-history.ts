import { EventBase } from '@/core/store/event-base';
import { MutationPayload } from 'vuex';

export interface UndoHistoryEvent {
    payload: MutationPayload;
}

/**
 * It's like a VCR but for mutations
 */
export class UndoHistory {
    constructor(public events: UndoHistoryEvent[] = [], public currentIndex: number = -1) {}

    /**
     * Add a new event to the history.
     * @param e The event to add.
     */
    push(e: UndoHistoryEvent) {
        // Did we rewind and go off in a new direction? Wipe out no longer needed events.
        if (this.currentIndex >= 0 && this.events.length - 1 > this.currentIndex) {
            this.events.splice(this.currentIndex + 1);
        }

        this.events.push(e);
        this.currentIndex++;
    }

    /**
     * Step back in time and move to the previous event.
     * @returns The event to undo.
     */
    rewind(): UndoHistoryEvent {
        if (!this.canRewind()) {
            throw Error('Nothing to rewind');
        }

        return this.events[this.currentIndex--];
    }

    /**
     * Jump into the future, and move back to the next event.
     * @returns The event to apply.
     */
    fastForward(): UndoHistoryEvent {
        if (!this.canFastForward()) {
            throw Error('Nothing to fastforward');
        }

        // Pre-increment so we get the event ahead of our current position.
        return this.events[++this.currentIndex];
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
}
