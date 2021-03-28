import { State } from '@/store/store';
import { confirmDelete } from '@/utils/confirm-delete';
import { doesFileExist, loadJsonFile, writeJsonFile } from '@/utils/file-utils';
import path from 'path';
import { ActionTree } from 'vuex';
import { EditorState, state } from './state';

const STATE_FILE_NAME = 'state.json';

export const actions: ActionTree<EditorState, State> = {
    async load(context) {
        const dataDirectory = context.rootState.config.dataDirectory;
        const filePath = path.join(dataDirectory, STATE_FILE_NAME);

        if (doesFileExist(filePath)) {
            const state = await loadJsonFile(filePath);
            this.commit('editor/SET_STATE', state);
        }
    },
    async save(context) {
        const dataDirectory = context.rootState.config.dataDirectory;
        const filePath = path.join(dataDirectory, STATE_FILE_NAME);

        await writeJsonFile(filePath, state);
    },
    async createTag() {
        this.commit('editor/CREATE_TAG');
        this.commit('editor/EXPAND_TAGS');
    },
    async createTagConfirm() {
        this.commit('editor/CREATE_TAG_CONFIRM');
    },
    async createTagCancel() {
        this.commit('editor/CREATE_TAG_CANCEL');
    },
    async updateTag(c, id: string) {
        this.commit('editor/UPDATE_TAG', id);
    },
    async updateTagConfirm() {
        this.commit('editor/UPDATE_TAG_CONFIRM');
    },
    async updateTagCancel() {
        this.commit('editor/UPDATE_TAG_CANCEL');
    },
    async deleteTag(c, id: string) {
        const confirm = await confirmDelete(
            'tag',
            c.state.globalNavigation.tags.entries.find((t) => t.id === id)!.value
        );

        if (confirm) {
            this.commit('editor/DELETE_TAG', id);
        }
    },
    async deleteAllTags() {
        this.commit('editor/DELETE_ALL_TAGS');
    }
};
