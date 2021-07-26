import { persist } from '@/store/plugins/persist/persist';
import { deserialize, serialize } from '@/features/notes/utils/persist';
import { createComposable, Module } from 'vuex-smart-module';
import { NoteActions } from '@/features/notes/store/actions';
import { NoteMutations } from '@/features/notes/store/mutations';
import { NoteGetters } from '@/features/notes/store/getters';
import { NoteState } from '@/features/notes/store/state';
import { undo } from '@/store/plugins/undo';

export const notes = new Module({
    namespaced: true,
    actions: NoteActions,
    mutations: NoteMutations,
    getters: NoteGetters,
    state: NoteState
});

export const useNotes = createComposable(notes);

persist.register({
    namespace: 'notes',
    initMutation: 'SET_STATE',
    serialize,
    deserialize
});
