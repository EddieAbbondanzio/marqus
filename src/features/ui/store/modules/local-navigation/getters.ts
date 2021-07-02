import { findNotebookRecursive } from '@/features/notebooks/common/find-notebook-recursive';
import { Notebook } from '@/features/notebooks/common/notebook';
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

        switch (active?.section) {
            case 'all':
                return rootState.notes.values.filter((note) => !note.trashed);

            case 'notebook':
                return rootState.notes.values.filter(
                    (note) =>
                        !note.trashed &&
                        note.notebooks != null &&
                        note.notebooks.some((id) => {
                            let notebook: Notebook | undefined = findNotebookRecursive(rootState.notebooks.values, id);

                            // A parent notebook should also show notes for any of it's children.
                            while (notebook != null) {
                                if (notebook.id === active.id) return true;
                                notebook = notebook!.parent;
                            }

                            return false;
                        })
                );

            case 'tag':
                return rootState.notes.values.filter(
                    (note) => !note.trashed && (note.tags ?? []).some((tag) => tag === active.id)
                );

            case 'favorites':
                return rootState.notes.values.filter((note) => !note.trashed && note.favorited);

            case 'trash':
                return rootState.notes.values.filter((n) => n.trashed);

            default:
                return [];
        }
    }
};
