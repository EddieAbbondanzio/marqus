import { MutationTree } from 'vuex';
import { State } from './state';

export const mutations: MutationTree<State> = {
    STATE(state, config) {
        Object.assign(state, config);
    },
    DIRTY(state) {
        state.dirty = true;
    },
    CLEAN(state) {
        state.dirty = false;
    }
};
