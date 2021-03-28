import { State } from '@/store/store';
import { confirmDelete } from '@/utils/confirm-delete';
import { doesFileExist, loadJsonFile, writeJsonFile } from '@/utils/file-utils';
import path from 'path';
import { ActionTree } from 'vuex';
import { EditorState, state } from './state';
import * as lockFile from 'proper-lockfile';

const STATE_FILE_NAME = 'state.json';

const saving: { current?: Promise<any>; next?: () => Promise<any> } = {};

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

        if (saving.current == null) {
            saving.current = writeJsonFile(filePath, state);
        } else if (saving.next == null) {
            saving.next = () => writeJsonFile(filePath, state);
        }

        // Save current
        await saving.current;
        delete saving.current;

        // Save next, if needed
        if (saving.next != null) {
            saving.next();
            delete saving.next;
        }
    },
    async createTag() {
        this.commit('editor/CREATE_TAG');
        this.commit('editor/EXPAND_TAGS');
    },
    async createTagConfirm() {
        this.commit('editor/CREATE_TAG_CONFIRM');
        this.commit('editor/SORT_TAGS');
    },
    async createTagCancel() {
        this.commit('editor/CREATE_TAG_CANCEL');
    },
    async updateTag(c, id: string) {
        this.commit('editor/UPDATE_TAG', id);
    },
    async updateTagConfirm() {
        this.commit('editor/UPDATE_TAG_CONFIRM');
        this.commit('editor/SORT_TAGS');
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
    },
    async createNotebook(c, parentId: string) {
        this.commit('editor/CREATE_NOTEBOOK', parentId);
        this.commit('editor/EXPAND_NOTEBOOKS');
    },
    async createNotebookConfirm() {
        this.commit('editor/CREATE_NOTEBOOK_CONFIRM');
        this.commit('editor/SORT_NOTEBOOKS');
    },
    async createNotebookCancel() {
        this.commit('editor/CREATE_NOTEBOOK_CANCEL');
    },
    async updateNotebook(c, id: string) {
        this.commit('editor/UPDATE_NOTEBOOK', id);
    },
    async updateNotebookConfirm() {
        this.commit('editor/UPDATE_NOTEBOOK_CONFIRM');
        this.commit('editor/SORT_NOTEBOOKS');
    },
    async updateNotebookCancel() {
        this.commit('editor/UPDATE_NOTEBOOK_CANCEL');
    },
    async deleteNotebook(c, id: string) {
        const confirm = await confirmDelete(
            'notebook',
            c.state.globalNavigation.notebooks.entries.find((n) => n.id === id)!.value
        );

        if (confirm) {
            this.commit('editor/DELETE_NOTEBOOK', id);
        }
    }
};
