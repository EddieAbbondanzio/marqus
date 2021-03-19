import { State } from '@/store/store';
import { ActionTree, MutationTree } from 'vuex';

const state: {
    mode: 'edit' | 'view';
} = {
    mode: 'view'
};

export type EditorState = typeof state;

const getters = {};

const actions: ActionTree<EditorState, State> = {};

const mutations: MutationTree<EditorState> = {};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
