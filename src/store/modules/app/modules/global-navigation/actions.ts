import { State } from '@/store/state';
import { confirmDelete } from '@/utils/confirm-delete';
import { Action, ActionContext, ActionTree } from 'vuex';
import { GlobalNavigation } from './state';

export const actions: ActionTree<GlobalNavigation, State> = {
    async tagInputStart({ commit }, id: string | null = null) {
        commit('TAG_INPUT_START', id);
        commit('TAGS_EXPANDED');
    },
    async tagInputConfirm({ commit, state, rootState }, value: string) {
        switch (state.tags.input.mode) {
            case 'create':
                commit('tags/CREATE', { id: state.tags.input.id, value: state.tags.input.value }, { root: true });
                break;

            case 'update':
                commit('tags/UPDATE', { id: state.tags.input.id, value: state.tags.input.value }, { root: true });
                break;

            default:
                throw new Error('Invalid mode');
        }

        commit('TAG_INPUT_CLEAR', value);
        commit('TAGS_REFRESH', rootState.tags.values);
        commit('TAGS_SORT');
    },
    async tagInputCancel({ commit }) {
        commit('TAG_INPUT_CLEAR');
    },
    async refresh({ commit, rootState }) {
        commit('TAGS_REFRESH', rootState.tags.values);
    },
    async deleteTag({ commit, state }, id: string) {
        const confirm = await confirmDelete('tag', state.tags.entries.find((t) => t.id === id)!.value);

        if (confirm) {
            commit('TAG_DELETE', id);
            commit('tags/DELETE', id, { root: true });
        }
    }
    // async deleteAllTags() {
    //     this.commit('app/globalNavigation/DELETE_ALL_TAGS');
    // },
    // async createNotebook(c, parentId: string) {
    //     this.commit('app/globalNavigation/CREATE_NOTEBOOK', parentId);
    //     this.commit('app/globalNavigation/EXPAND_NOTEBOOKS');
    // },
    // async createNotebookConfirm() {
    //     this.commit('app/globalNavigation/CREATE_NOTEBOOK_CONFIRM');
    //     this.commit('app/globalNavigation/SORT_NOTEBOOKS');
    // },
    // async createNotebookCancel() {
    //     this.commit('app/globalNavigation/CREATE_NOTEBOOK_CANCEL');
    // },
    // async updateNotebook(c, id: string) {
    //     this.commit('app/globalNavigation/UPDATE_NOTEBOOK', id);
    // },
    // async updateNotebookConfirm() {
    //     this.commit('app/globalNavigation/UPDATE_NOTEBOOK_CONFIRM');
    //     this.commit('app/globalNavigation/SORT_NOTEBOOKS');
    // },
    // async updateNotebookCancel() {
    //     this.commit('app/globalNavigation/UPDATE_NOTEBOOK_CANCEL');
    // },
    // async deleteNotebook(c, id: string) {
    //     const confirm = await confirmDelete('notebook', c.state.notebooks.entries.find((n) => n.id === id)!.value);

    //     if (confirm) {
    //         this.commit('app/globalNavigation/DELETE_NOTEBOOK', id);
    //     }
    // }
};
