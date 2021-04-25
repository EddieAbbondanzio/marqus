import { id } from '@/utils/id';
import { MutationTree } from 'vuex';
import { LocalNavigationState } from './state';

export const mutations: MutationTree<LocalNavigationState> = {
    WIDTH(s, width) {
        s.width = width;
    }
};
