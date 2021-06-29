import { state } from './state';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { persist } from '@/store/plugins/persist/persist';
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
    initMutation: 'SET_STATE',
    serialize,
    deserialize
});
