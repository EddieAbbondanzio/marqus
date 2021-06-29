import { UndoHistory } from '@/store/plugins/undo/undo-history';
import { MutationPayload, Store } from 'vuex';

export class UndoModule {
    history: UndoHistory;
    initialState: any;

    constructor(public store: Store<any>, public settings: UndoModuleSettings) {
        this.history = new UndoHistory();
    }

    cache(mutation: MutationPayload) {
        this.history.push(mutation);
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
            this.store.commit(`${this.settings.namespace}/${m.payload.type}`, m.payload.payload);
        }
    }

    redo() {
        // Revert to initial state.
        this.store.commit(`${this.settings.namespace}/${this.settings.setStateMutation}`, this.initialState);

        const mutations = this.history.fastForward();

        // Replay up to, but not the last mutation
        for (const m of mutations) {
            this.store.commit(`${this.settings.namespace}/${m.payload.type}`, m.payload.payload);
        }
    }
}

export interface UndoModuleSettings {
    namespace: string;
    setStateMutation: string;
}
