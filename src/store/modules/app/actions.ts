import { State } from '@/store/store';
import { confirmDelete } from '@/utils/confirm-delete';
import { doesFileExist, loadJsonFile, writeJsonFile } from '@/utils/file-utils';
import path from 'path';
import { ActionTree } from 'vuex';
import { AppState, state } from './state';
import * as lockFile from 'proper-lockfile';

const STATE_FILE_NAME = 'state.json';

const saving: { current?: Promise<any>; next?: () => Promise<any> } = {};

export const actions: ActionTree<AppState, State> = {
    async load(context) {
        const dataDirectory = context.rootState.config.dataDirectory;
        const filePath = path.join(dataDirectory, STATE_FILE_NAME);

        if (doesFileExist(filePath)) {
            const state = await loadJsonFile(filePath);
            this.commit('app/SET_STATE', state);
        }
    },
    async save(context) {
        const dataDirectory = context.rootState.config.dataDirectory;
        const filePath = path.join(dataDirectory, STATE_FILE_NAME);

        // Deep copy so we can purge some data without effecting vuex
        const state = JSON.parse(JSON.stringify(context.state));
        state.globalNavigation.notebooks.dragging = undefined;

        /*
         * There be dragons here. This is written in a way to prevent a
         * race condition from occuring when writing the file. Race conditions
         * will corrupt the JSON because more than 1 process is writing the
         * file at the same time causing for overlaps, etc.
         */

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
        const confirm = await confirmDelete(
            'tag',
            c.state.globalNavigation.tags.entries.find((t) => t.id === id)!.value
        );

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
        const confirm = await confirmDelete(
            'notebook',
            c.state.globalNavigation.notebooks.entries.find((n) => n.id === id)!.value
        );

        if (confirm) {
            this.commit('app/DELETE_NOTEBOOK', id);
        }
    }
};
