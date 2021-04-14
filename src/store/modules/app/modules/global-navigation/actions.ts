import { State } from '@/store/state';
import { confirmDelete } from '@/utils/confirm-delete';
import { Action, ActionContext, ActionTree } from 'vuex';
import { GlobalNavigation } from './state';

export const actions: ActionTree<GlobalNavigation, State> = {
    async tagInputStart({ commit, rootState, state }, id: string | null = null) {
        const tag = rootState.tags.values.find((t) => t.id === id);

        // Only throw error if an id was passed (update), but no matching tag found
        if (tag == null && id != null) {
            throw new Error(`No tag with id ${id} found.`);
        }
        commit('TAG_INPUT_START', tag);
        commit('TAGS_EXPANDED');
    },
    async tagInputConfirm({ commit, state, rootState }, value: string) {
        const input = state.tags.input;

        switch (input.mode) {
            case 'create':
                commit('tags/CREATE', { id: input.id, value: input.value }, { root: true });
                break;

            case 'update':
                commit('tags/UPDATE', { id: input.id, value: input.value }, { root: true });
                break;

            default:
                throw new Error(`Invalid tag input mode: ${state.tags.input.mode}`);
        }

        commit('TAG_INPUT_CLEAR', value);
        commit('tags/SORT', null, { root: true });
        commit('DIRTY', null, { root: true });
    },
    async tagInputCancel({ commit }) {
        commit('TAG_INPUT_CLEAR');
    },
    async tagDelete({ commit, state, rootState }, id: string) {
        const confirm = await confirmDelete('tag', rootState.tags.values.find((t) => t.id === id)!.value);

        if (confirm) {
            commit('tags/DELETE', id, { root: true });
            commit('DIRTY', null, { root: true });
        }
    },
    async notebookInputStart({ commit }, id: string | null = null, parentId: string | null = null) {
        commit('NOTEBOOK_INPUT_START', { id, parentId });
        commit('TAGS_EXPANDED');
    }
    
};
