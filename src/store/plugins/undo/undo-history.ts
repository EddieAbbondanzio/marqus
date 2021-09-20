import { v4 as uuidv4 } from 'uuid';
import { MutationPayload } from 'vuex';
import { Mutations, Payload } from 'vuex-smart-module/lib/assets';

export interface UndoSequenceCommitMetadata {
    ignore?: boolean;
    cache?:{[key: string]: any};
    onUndo?: () => any;
    onRedo?: () => any;
}

export class UndoSequenceCommit {
    constructor(public readonly apply: () => void, private meta: UndoSequenceCommitMetadata = {}) {
    }

    static create(externalCommit: () => void): UndoSequenceCommit;
    static create<T, K extends keyof Mutations<T>>(key: K, payload: Payload<Mutations<T>[K]>): UndoSequenceCommit;
    static create(...args: any[]): UndoSequenceCommit {
        throw Error
    }

    ignore(): UndoSequenceCommit {
        return new UndoSequenceCommit(this.apply, { ignore: true, ...this.meta });
    }

    cache(cb: (cache: {[key: string]: any}) => any): UndoSequenceCommit {
        // eslint-disable-next-line
        const cache = cb({});
        return new UndoSequenceCommit(this.apply, { ignore: true, cache, ...this.meta });
    }

    onUndo(cb: () => any): UndoSequenceCommit {
        return new UndoSequenceCommit(this.apply, { onUndo: cb, ...this.meta })
    }

    onRedo(cb: () => any): UndoSequenceCommit {
        return new UndoSequenceCommit(this.apply, { onRedo: cb, ...this.meta })
    }
}

export class UndoSequence {
    constructor(public readonly id: string, public readonly mutations: UndoSequenceCommit[] = []) {}
    
    apply() {
        this.mutations.forEach((v) => v.apply());
    }
}

/**
 * It's like a VCR but for mutations
 */
export class UndoHistory {
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
    get sequences(): ReadonlyArray<UndoSequence> {
        return this._sequences;
    }

    hardLimit?: number;

    /**
     * Create a new undo history.
     * @param _sequences The events that have occured.
     * @param _currentIndex The current position in the history.
     */
    constructor(private _sequences: UndoSequence[] = [], private _currentIndex = 0) {
        if (_currentIndex < 0 || _currentIndex > _sequences.length) {
            throw Error(`Current index ${_currentIndex} out of range.`);
        }
    }

    /**
     * Add a new event to the history.
     * @param e The event to add.
     */
    push(e: MutationPayload) {
        // Populate empty metadata in case it's missing. Not really needed, but makes our life easier.
        // e.payload._undo ??= {};
        // const metadata = e.payload._undo as UndoMetadata;

        // if (metadata.ignore) {
        //     // return;
        // }

        // // console.log('push: ', e);

        // // Grouped mutation
        // if (metadata.group != null) {
        //     if (metadata.isReplay) {
        //         return;
        //     }

        //     const g = this._active[metadata.group.id];

        //     if (g == null) {
        //         throw Error(`No undo group ${metadata.group.id} found. Did you wrap the commit inside a undoGroup?`);
        //     }

        //     // console.log('added to group ', g);
        //     g.mutations.push(e);

        //     // On first mutation added, add it to the event history
        //     if (g.mutations.length === 1) {
        //         this._sequences.push(g);
        //         this._currentIndex++;
        //     }
        // // eslint-disable-next-line
        // }
        // // Normal mutation
        // else {
        //     // Did we rewind?
        //     if (this._sequences.length > this._currentIndex) {
        //         // Edge case of changing directions. IE undid 1 or more mutations, and then proceeded to add new mutations
        //         if (!metadata.isReplay) {
        //             this._sequences = [...this._sequences.slice(0, this.currentIndex), e];
        //             this._currentIndex = this._sequences.length;
        //         } else {
        //             this._currentIndex++;
        //         }
        //     } else {
        //         this._sequences.push(e);
        //         this._currentIndex++;
        //     }

        //     // console.log('added to history')
        // }
    }

    /**
     * Step back in time and move to the previous event.
     * @param index The index to jump back to
     * @returns The event to undo.
     */
    undo(replayStartIndex: number, stopIndex: number): [replay: UndoSequence[], undone: UndoSequence] {
        // console.log('curr index: ', this._currentIndex, ' jump back to: ', replayStartIndex, ' but stop at: ', stopIndex)
        if (!this.canUndo()) {
            throw Error('Nothing to undo');
        }

        const toReplay = this._sequences.slice(replayStartIndex, stopIndex);
        const undone = this._sequences[stopIndex]; // Intentional. We don't want to return them all.

        // for (const mutation of toReplay) {
        //     if (isUndoGroup(mutation)) {
        //         mutation.mutations.forEach(m => (m.payload._undo.isReplay = true));
        //     } else {
        //         mutation.payload._undo ??= {};
        //         mutation.payload._undo.isReplay = true;
        //     }
        // }

        // Jump back to what we rewinded to before
        this._currentIndex = stopIndex;

        return [toReplay, undone];
    }

    /**
     * Jump into the future, and move back to the next event.
     * @returns The event to apply.
     */
    redo(): UndoSequence {
        if (!this.canRedo()) {
            throw Error('Nothing to redo');
        }
        const toReplay = this._sequences[this._currentIndex];

        // if (isUndoGroup(toReplay)) {
        //     toReplay.mutations.forEach(m => (m.payload._undo.isReplay = true));
        // } else {
        //     toReplay.payload._undo ??= {};
        //     toReplay.payload._undo.isReplay = true;
        // }

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
        return this._sequences.length > 0 && this._currentIndex < this._sequences.length;
    }

    /**
     * Start a new group. Basically a unit of work, but for undo / redo.
     * @returns The id of the group being started.
     */
    createSequence(): UndoSequence {
        const id = uuidv4();
        return new UndoSequence(id);
    }

    /**
     * Set a hard limit in the history that will prevent the user from undo-ing too much.
     * Useful for when we need to track some local input but prevent the user from holding
     * control-z too long and accidentallly wiping out stuff.
     */
    setRollbackPoint() {
        this.hardLimit = this.currentIndex;
    }

    /**
     * Release the hard limit. (Deletes it).
     */
    releaseRollbackPoint() {
        delete this.hardLimit;
    }
}
