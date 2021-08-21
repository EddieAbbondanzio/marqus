import { findNotebookRecursive } from '@/features/notebooks/common/find-notebook-recursive';
import { Notebook } from '@/features/notebooks/common/notebook';
import { notebooks } from '@/features/notebooks/store';
import { notes } from '@/features/notes/store';
import { globalNavigation } from '@/features/ui/store/modules/global-navigation';
import { GetterTree, Store } from 'vuex';
import { Context, Getters } from 'vuex-smart-module';
import { LocalNavigationState } from './state';

export class LocalNavigationGetters extends Getters<LocalNavigationState> {
    globalNav!: Context<typeof globalNavigation>;
    notes!: Context<typeof notes>;
    notebooks!: Context<typeof notebooks>;

    $init(store: Store<any>) {
        this.notes = notes.context(store);
        this.globalNav = globalNavigation.context(store);
        this.notebooks = notebooks.context(store);
    }

    get isNoteBeingCreated() {
        return this.state.notes.input?.mode === 'create';
    }

    isNoteBeingUpdated(id: string) {
        return this.state.notes.input?.mode === 'update' && this.state.notes.input.id === id;
    }

    isActive(id: string) {
        return this.state.active === id;
    }

    get activeNotes() {
        const active = this.globalNav.state.active;

        switch (active?.section) {
            case 'all':
                return this.notes.getters.where((n) => !n.trashed);

            case 'notebook':
                if (active.id == null) {
                    return this.notes.getters.where((n) => n.notebooks.length > 0 && !n.trashed);
                }

                return this.notes.getters.where(
                    (n) =>
                        !n.trashed &&
                        n.notebooks != null &&
                        n.notebooks.some((id) => {
                            let notebook: Notebook | undefined = findNotebookRecursive(this.notebooks.state.values, id);

                            // A parent notebook should also show notes for any of it's children.
                            while (notebook != null) {
                                if (notebook.id === active.id) return true;
                                notebook = notebook!.parent;
                            }

                            return false;
                        })
                );

            case 'tag':
                if (active.id == null) {
                    return this.notes.getters.where((n) => !n.trashed && n.tags.length > 0);
                }

                return this.notes.getters.where((n) => !n.trashed && (n.tags ?? []).some((tag) => tag === active.id));

            case 'favorites':
                return this.notes.getters.where((n) => !n.trashed && (n.favorited ?? false));

            case 'trash':
                return this.notes.getters.where((n) => n.trashed ?? false);

            default:
                return [];
        }
    }
}
