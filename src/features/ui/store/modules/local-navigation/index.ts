import { state } from './state';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { undo } from '@/store/plugins/undo/undo';

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};

undo.registerModule(state, {
    name: 'localNavigation',
    namespace: 'ui/localNavigation',
    setStateMutation: 'SET_STATE',
    stateCacheInterval: 100
});
