import { generateId } from '@/store';
import { MutationTree } from 'vuex';
import { Mutations } from 'vuex-smart-module';
import { LocalNavigationState } from './state';

// Temp bandaid
type UndoPayload<T> = any;
type VoidUndoPayload = any;

export class LocalNavigationMutations extends Mutations<LocalNavigationState> {
    SET_STATE(s: LocalNavigationState) {
        Object.assign(this.state, s);
    }

    SET_ACTIVE({ value }: UndoPayload<string>) {
        this.state.active = value;
    }

    SET_NOTE_INPUT({ value }: UndoPayload<string>) {
        if (this.state.notes.input == null) {
            return;
        }

        this.state.notes.input.name = value;
    }

    CLEAR_NOTE_INPUT(p: VoidUndoPayload) {
        delete this.state.notes.input;
    }

    SET_WIDTH(p: UndoPayload<string>) {
        this.state.width = p.value;
    }

    START_NOTE_INPUT({
        value: { note, globalNavigationActive }
    }: UndoPayload<{
        note?: { id: string; name: string };
        globalNavigationActive?: { id: string; type: 'notebook' | 'tag' };
    }>) {
        if (note == null) {
            this.state.notes.input = {
                name: '',
                id: generateId(),
                mode: 'create'
            };

            // If an active record was passed, assign it as a tag, or notebook.
            if (globalNavigationActive != null && typeof globalNavigationActive !== 'string') {
                switch (globalNavigationActive.type) {
                    case 'notebook':
                        this.state.notes.input.notebooks = [globalNavigationActive.id];
                        break;

                    case 'tag':
                        this.state.notes.input.tags = [globalNavigationActive.id];
                        break;
                }
            }
        }
        // Update
        else {
            this.state.notes.input = {
                id: note.id,
                name: note.name,
                mode: 'update'
            };
        }
    }
}
