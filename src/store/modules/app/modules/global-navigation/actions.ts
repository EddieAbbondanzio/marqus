import { State } from '@/store/state';
import { confirmDelete } from '@/utils/confirm-delete';
import { ActionTree } from 'vuex';
import { GlobalNavigation } from './state';

export const actions: ActionTree<GlobalNavigation, State> = {
    async createTag() {
        this.commit('app/CREATE_TAG');
        this.commit('app/EXPAND_TAGS');
    },
    async createTagConfirm() {
        this.commit('app/CREATE_TAG_CONFIRM');
        this.commit('app/SORT_TAGS');
    },
    async createTagCancel() {
        this.commit('app/CREATE_TAG_CANCEL');
    },
    async updateTag(c, id: string) {
        this.commit('app/UPDATE_TAG', id);
    },
    async updateTagConfirm() {
        this.commit('app/UPDATE_TAG_CONFIRM');
        this.commit('app/SORT_TAGS');
    },
    async updateTagCancel() {
        this.commit('app/UPDATE_TAG_CANCEL');
    },
    async deleteTag(c, id: string) {
        const confirm = await confirmDelete('tag', c.state.tags.entries.find((t) => t.id === id)!.value);

        if (confirm) {
            this.commit('app/DELETE_TAG', id);
        }
    },
    async deleteAllTags() {
        this.commit('app/DELETE_ALL_TAGS');
    },
    async createNotebook(c, parentId: string) {
        this.commit('app/CREATE_NOTEBOOK', parentId);
        this.commit('app/EXPAND_NOTEBOOKS');
    },
    async createNotebookConfirm() {
        this.commit('app/CREATE_NOTEBOOK_CONFIRM');
        this.commit('app/SORT_NOTEBOOKS');
    },
    async createNotebookCancel() {
        this.commit('app/CREATE_NOTEBOOK_CANCEL');
    },
    async updateNotebook(c, id: string) {
        this.commit('app/UPDATE_NOTEBOOK', id);
    },
    async updateNotebookConfirm() {
        this.commit('app/UPDATE_NOTEBOOK_CONFIRM');
        this.commit('app/SORT_NOTEBOOKS');
    },
    async updateNotebookCancel() {
        this.commit('app/UPDATE_NOTEBOOK_CANCEL');
    },
    async deleteNotebook(c, id: string) {
        const confirm = await confirmDelete('notebook', c.state.notebooks.entries.find((n) => n.id === id)!.value);

        if (confirm) {
            this.commit('app/DELETE_NOTEBOOK', id);
        }
    }
};
