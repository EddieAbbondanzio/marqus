import { state } from './state';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { mediator } from '@/core/store/plugins/mediator/mediator';

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
