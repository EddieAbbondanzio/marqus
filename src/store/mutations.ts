import { MutationTree } from 'vuex';
import { State } from './state';

export const mutations: MutationTree<State> = {
    SET_STATE: (state, config) => {
        Object.assign(state, config);
    }
};
