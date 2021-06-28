import { MutationTree } from 'vuex';
import { LocalNavigation } from './state';

export const mutations: MutationTree<LocalNavigation> = {
    SET_ACTIVE(s, newValue: string) {
        s.active = newValue;
    },
    SET_NOTE_INPUT_NAME(s, newValue: string) {
        s.notes.input!.name = newValue;
    },
    CLEAR_NOTE_INPUT(s) {
        delete s.notes.input;
    },
    SET_WIDTH(s, newValue: string) {
        s.width = newValue;
    },
    START_NOTE_INPUT(
        s,
        {
            note,
            globalNavigationActive
        }: { note?: { id: string; name: string }; globalNavigationActive?: { id: string; type: 'notebook' | 'tag' } }
    ) {
        if (note == null) {
            s.notes.input = {
                name: '',
                mode: 'create'
            };

            // If an active record was passed, assign it as a tag, or notebook.
            if (globalNavigationActive != null && typeof globalNavigationActive !== 'string') {
                switch (globalNavigationActive.type) {
                    case 'notebook':
                        s.notes.input.notebooks = [globalNavigationActive.id];
                        break;

                    case 'tag':
                        s.notes.input.tags = [globalNavigationActive.id];
                        break;
                }
            }
        }
        // Update
        else {
            s.notes.input = {
                id: note.id,
                name: note.name,
                mode: 'update'
            };
        }
    }
};
