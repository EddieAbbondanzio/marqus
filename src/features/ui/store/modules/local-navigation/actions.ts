import { Note } from '@/features/notes/common/note';
import { notes } from '@/features/notes/store';
import { globalNavigation } from '@/features/ui/store/modules/global-navigation';
import { LocalNavigationGetters } from '@/features/ui/store/modules/local-navigation/getters';
import { LocalNavigationMutations } from '@/features/ui/store/modules/local-navigation/mutations';
import { confirmDeleteOrTrash } from '@/shared/utils';
import { generateId } from '@/store';
import { ActionTree, Store } from 'vuex';
import { Actions, Context } from 'vuex-smart-module';
import { LocalNavigationState } from './state';

export class LocalNavigationActions extends Actions<
    LocalNavigationState,
    LocalNavigationGetters,
    LocalNavigationMutations,
    LocalNavigationActions
> {
    globalNav!: Context<typeof globalNavigation>;
    notes!: Context<typeof notes>;

    $init(store: Store<any>) {
        this.globalNav = globalNavigation.context(store);
        this.notes = notes.context(store);
    }

    setActive(id: string) {
        this.commit('SET_ACTIVE', { value: id });
    }

    noteInputStart({ id }: { id?: string } = {}) {
        let note: Note | undefined;

        if (id != null) {
            note = this.notes.getters.byId(id, { required: true });
        }

        let active: any;

        if (this.globalNav.state.active?.section === 'tag' || this.globalNav.state.active?.section === 'notebook') {
            active = {
                id: this.globalNav.state.active.id,
                type: this.globalNav.state.active.section
            };
        }

        this.commit('START_NOTE_INPUT', {
            value: { note, globalNavigationActive: active }
        });
    }

    noteInputUpdate(value: string) {
        this.commit('SET_NOTE_INPUT', { value });
    }

    noteInputConfirm() {
        const input = this.state.notes.input!;
        let note: Note;
        let old: Note | undefined;

        switch (input.mode) {
            case 'create':
                note = {
                    id: generateId(),
                    dateCreated: new Date(),
                    dateModified: new Date(),
                    name: input.name,
                    notebooks: input.notebooks ?? [],
                    tags: input.tags ?? []
                };

                this.notes.commit('CREATE', { value: note });
                break;

            case 'update':
                old = this.notes.getters.byId(input.id, { required: true });

                this.notes.commit('SET_NAME', { value: { note: old, newName: input.name } });
                break;
        }

        this.commit('CLEAR_NOTE_INPUT', {});
    }

    noteInputCancel() {
        this.commit('CLEAR_NOTE_INPUT', {});
    }

    async noteDelete(id: string) {
        if (id == null) {
            throw Error();
        }

        const note = this.notes.getters.byId(id, { required: true });

        const confirm = await confirmDeleteOrTrash('note', note.name);

        switch (confirm) {
            case 'delete':
                this.notes.commit('DELETE', { value: id });
                break;

            case 'trash':
                this.notes.commit('MOVE_TO_TRASH', { value: id });
                break;
        }
    }

    widthUpdated(width: string) {
        this.commit('SET_WIDTH', { value: width });
    }
}
