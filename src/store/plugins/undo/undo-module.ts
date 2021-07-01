import { Queue } from '@/store/plugins/undo/queue';
import { isUndoGroup } from '@/store/plugins/undo/types';
import { UndoHistory } from '@/store/plugins/undo/undo-history';
import { MutationPayload, Store } from 'vuex';

export class UndoModule {
    history: UndoHistory;
    initialState: any;

    constructor(public store: Store<any>, public settings: UndoModuleSettings) {
        this.history = new UndoHistory();
    }

    cache(mutation: MutationPayload) {
        // Check to see if it was grouped
        if (mutation.payload.undoGroup != null) {
        } else {
            this.history.push(mutation);
        }
    }

    canUndo() {
        return this.history.canRewind();
    }

    canRedo() {
        return this.history.canFastForward();
    }

    undo() {
        // Revert to initial state.
        this.store.commit(`${this.settings.namespace}/${this.settings.setStateMutation}`, this.initialState);

        const mutations = this.history.rewind();

        // Replay up to, but not the last mutation
        for (const m of mutations) {
            if (isUndoGroup(m)) {
                m.mutations.forEach((mut) =>
                    this.store.commit(`${this.settings.namespace}/${mut.payload.type}`, mut.payload.payload)
                );
            } else {
                this.store.commit(`${this.settings.namespace}/${m.payload.type}`, m.payload.payload);
            }
        }
    }

    redo() {
        // Revert to initial state.
        this.store.commit(`${this.settings.namespace}/${this.settings.setStateMutation}`, this.initialState);

        const mutations = this.history.fastForward();

        // Replay up to, but not the last mutation
        for (const m of mutations) {
            if (isUndoGroup(m)) {
                m.mutations.forEach((mut) =>
                    this.store.commit(`${this.settings.namespace}/${mut.payload.type}`, mut.payload.payload)
                );
            } else {
                this.store.commit(`${this.settings.namespace}/${m.payload.type}`, m.payload.payload);
            }
        }
    }
}

export interface UndoModuleSettings {
    namespace: string;
    setStateMutation: string;
}
