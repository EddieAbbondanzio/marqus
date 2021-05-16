import { Note } from '@/store/modules/notes/state';
import { generateId } from '@/utils/id';
import { MutationTree } from 'vuex';
import { LocalNavigation } from './state';

export const mutations: MutationTree<LocalNavigation> = {
    WIDTH(s, width) {
        s.width = width;
    },
    NOTE_INPUT_VALUE(s, value: string) {
        s.notes.input.name = value;
    },
    NOTE_INPUT_CLEAR(s) {
        s.notes.input = {};
    },
    NOTE_INPUT_START(s, { note, active }: { note?: Note; active?: { id: string; type: 'notebook' | 'tag' } }) {
        // Create
        if (note == null) {
            s.notes.input = {
                id: generateId(),
                name: '',
                dateCreated: new Date(),
                dateModified: new Date(),
                mode: 'create'
            };

            // If an active record was passed, assign it as a tag, or notebook.
            if (active != null) {
                switch (active.type) {
                    case 'notebook':
                        s.notes.input.notebooks = [active.id];
                        break;

                    case 'tag':
                        s.notes.input.tags = [active.id];
                        break;
                }
            }
        }
        // Update
        else {
            s.notes.input = {
                id: note.id,
                name: note.name,
                dateCreated: note.dateCreated,
                dateModified: note.dateModified,
                tags: note.tags,
                notebooks: note.notebooks,
                mode: 'update'
            };
        }
    },
    ACTIVE(s, active?: string) {
        s.active = s.active === active ? undefined : active;
    }
};
