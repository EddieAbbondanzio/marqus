import { generateId } from '@/core/store/entity';
import { MutationTree } from 'vuex';
import { LocalNavigation } from './state';
import { mapEventSourcedMutations } from '@/core/store/map-event-sourced-mutations';

export const mutations: MutationTree<LocalNavigation> = {
    ACTIVE_UPDATED(s, newValue: string) {
        s.active = newValue;
    },
    NOTE_INPUT_NAME_UPDATED(s, newValue: string) {
        s.notes.input!.name = newValue;
    },
    NOTE_INPUT_CLEARED(s) {
        delete s.notes.input;
    },
    WIDTH_UPDATED(s, newValue: string) {
        s.width = newValue;
    },
    NOTE_INPUT_STARTED(
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
