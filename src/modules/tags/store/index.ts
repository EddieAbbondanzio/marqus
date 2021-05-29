import { state } from './state';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { persist } from '@/core/store/plugins/persist/persist';

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};

persist.register({
    namespace: 'tags',
    fileName: 'tags.json',
    initMutation: 'INIT'
});
