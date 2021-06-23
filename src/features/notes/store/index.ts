import { NoteState, state } from './state';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { persist } from '@/store/plugins/persist/persist';
import { fileSystem } from '@/utils/file-system';
import path from 'path';
import moment from 'moment';
import { regex } from '@/utils/regex';
import { MutationPayload } from 'vuex';
import { State } from '@/store/state';
import { Note } from '@/features/notes/common/note';
import { deserialize, serialize } from '@/features/notes/store/persist';

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};

export const NOTES_DIRECTORY = 'notes';

persist.register({
    namespace: 'notes',
    initMutation: 'INIT',
    serialize,
    deserialize
});
