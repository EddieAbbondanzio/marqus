import { Note } from '@/features/notes/common/note';
import { notes } from '@/features/notes/store';
import { globalNavigation } from '@/features/ui/store/modules/global-navigation';
import { LocalNavigationGetters } from '@/features/ui/store/modules/local-navigation/getters';
import { LocalNavigationMutations } from '@/features/ui/store/modules/local-navigation/mutations';
import { confirmDeleteOrTrash } from '@/shared/utils';
import { generateId } from '@/store';
import { undo, UndoContext } from '@/store/plugins/undo';
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

    undoContext!: UndoContext;

    $init(store: Store<any>) {
        this.globalNav = globalNavigation.context(store);
        this.notes = notes.context(store);

        this.undoContext = undo.getContext({ name: 'localNavigation' });
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
            value: { note, globalNavigationActive: active },
            _undo: { ignore: true }
        });
    }

    noteInputUpdate(value: string) {
        this.commit('SET_NOTE_INPUT', { value, _undo: { ignore: true } });
    }

    noteInputConfirm() {
        // We group it so we can track
        this.undoContext.group((_undo) => {
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

                    _undo.cache.note = note;
                    this.notes.commit('CREATE', {
                        value: note,
                        _undo: {
                            ..._undo,
                            undoCallback: (m) => this.notes.commit('DELETE', { value: m.payload.value.id }),
                            redoCallback: (m) => this.notes.commit('CREATE', m.payload._undo.cache.note)
                        }
                    });
                    break;

                case 'update':
                    old = this.notes.getters.byId(input.id, { required: true });

                    _undo.cache.oldName = old.name;
                    this.notes.commit('SET_NAME', {
                        value: { note: old, newName: input.name },
                        _undo: {
                            ..._undo,
                            undoCallback: (m) =>
                                this.notes.commit('SET_NAME', {
                                    value: { note: m.payload.value.note, newName: m.payload._undo.cache.oldName }
                                }),
                            redoCallback: (m) => this.notes.commit('SET_NAME', { value: m.payload.value })
                        }
                    });
                    break;
            }

            _undo.ignore = true;
            this.commit('CLEAR_NOTE_INPUT', { _undo });
        });
    }

    noteInputCancel() {
        this.commit('CLEAR_NOTE_INPUT', { _undo: { ignore: true } });
    }

    async noteDelete(id: string) {
        if (id == null) {
            throw Error();
        }

        const note = this.notes.getters.byId(id, { required: true });

        const confirm = await confirmDeleteOrTrash('note', note.name);

        switch (confirm) {
            case 'delete':
                // permanent wasn't a joke.
                this.notes.commit('DELETE', { value: id, _undo: { ignore: true } });
                break;

            case 'trash':
                this.undoContext.group((_undo) => {
                    this.notes.commit('MOVE_TO_TRASH', {
                        value: id,
                        _undo: {
                            ..._undo,
                            undoCallback: (m) => this.notes.commit('RESTORE_FROM_TRASH', { value: m.payload.value }),
                            redoCallback: (m) => this.notes.commit('MOVE_TO_TRASH', { value: m.payload.value })
                        }
                    });
                });
                break;
        }
    }

    widthUpdated(width: string) {
        this.commit('SET_WIDTH', { value: width, _undo: { ignore: true } });
    }
}
