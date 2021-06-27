import { Notebook } from '@/features/notebooks/common/notebook';
import { findNotebookRecursive } from '@/features/notebooks/store/mutations';
import { Note } from '@/features/notes/common/note';
import { State } from '@/store/state';
import { GetterTree } from 'vuex';
import { LocalNavigation } from './state';

export const getters: GetterTree<LocalNavigation, State> = {
    isNoteBeingCreated: (s) => s.notes.input?.mode === 'create',
    isNoteBeingUpdated: (s) => (id: string) => {
        return s.notes.input?.mode === 'update' && s.notes.input.id === id;
    },
    isActive: (s) => (id: string) => s.active === id,
    activeNotes: (_s, _g, rootState) => {
        const active = rootState.ui.globalNavigation.active;

        if (active == null) {
            return [];
        }

        if (active === 'trash') {
            return rootState.notes.values.filter((n) => n.trashed);
        }

        let notes: Note[] = rootState.notes.values;

        // Handle object cases
        if (typeof active === 'object') {
            switch (active.type) {
                case 'notebook':
                    notes = rootState.notes.values.filter(
                        (note) =>
                            note.notebooks != null &&
                            note.notebooks.some((id) => {
                                let notebook: Notebook | undefined = findNotebookRecursive(
                                    rootState.notebooks.values,
                                    id
                                );

                                // A parent notebook should also show notes for any of it's children.
                                while (notebook != null) {
                                    if (notebook.id === active.id) return true;
                                    notebook = notebook!.parent;
                                }

                                return false;
                            })
                    );
                    break;

                case 'tag':
                    notes = rootState.notes.values.filter((note) => (note.tags ?? []).some((tag) => tag === active.id));
                    break;
            }
        } else if (active === 'favorites') {
            notes = notes.filter((n) => n.favorited);
        }

        // Remove any notes that are in the trash
        notes = notes.filter((n) => !n.trashed);

        return notes;
    }
};
