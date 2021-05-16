import { findNotebookRecursive } from '@/store/modules/notebooks/mutations';
import { Notebook } from '@/store/modules/notebooks/state';
import { Note } from '@/store/modules/notes/state';
import { State } from '@/store/state';
import { GetterTree } from 'vuex';
import { LocalNavigation } from './state';

export const getters: GetterTree<LocalNavigation, State> = {
    isNoteBeingCreated: (s) => s.notes.input.mode === 'create',
    isNoteBeingUpdated: (s) => (id: string) => {
        return s.notes.input.mode === 'update' && s.notes.input.id === id;
    },
    activeNotes: (_s, _g, rootState) => {
        const active = rootState.app.globalNavigation.active;

        if (active == null) {
            return [];
        }

        // Handle string cases
        switch (active) {
            case 'all':
                return rootState.notes.values;
            case 'favorites':
                console.log('implement favorites in activeNotes getter!');
                return []; // TODO: Implement this.
            case 'trash':
                return rootState.notes.values.filter((n) => n.trashed);
        }

        let notes: Note[] = [];

        // Handle object cases
        switch (active.type) {
            case 'notebook':
                notes = rootState.notes.values.filter(
                    (note) =>
                        note.notebooks != null &&
                        note.notebooks.some((id) => {
                            let notebook: Notebook | undefined = findNotebookRecursive(rootState.notebooks.values, id)!;

                            // A parent notebook should also show notes for any of it's children.
                            do {
                                if (notebook!.id === active.id) {
                                    return true;
                                }

                                notebook = notebook!.parent;
                            } while (notebook != null);

                            return false;
                        })
                );
                break;

            case 'tag':
                notes = rootState.notes.values.filter((note) => (note.tags ?? []).some((tag) => tag === active.id));
                break;
        }

        // Remove any notes that are in the trash
        notes = notes.filter((n) => !n.trashed);

        return notes;
    }
};
