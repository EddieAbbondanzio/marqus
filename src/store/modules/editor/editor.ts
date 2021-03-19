import { State } from '@/store/store';
import { ActionTree, MutationTree } from 'vuex';
import path from 'path';
import { doesFileExist, loadJsonFile, writeJsonFile } from '@/utils/load-json-file';

const state: {
    mode: 'edit' | 'view';
    'window.globalNavigation.width': string;
    'window.localNavigation.width': string;
} = {
    mode: 'view',
    'window.globalNavigation.width': '300px',
    'window.localNavigation.width': '300px'
};

export type EditorState = typeof state;

const getters = {};

const actions: ActionTree<EditorState, State> = {
    async load(context) {
        const dataDirectory = context.rootState.config.dataDirectory;
        const filePath = path.join(dataDirectory, 'state.json');

        if (await doesFileExist(filePath)) {
            const state = await loadJsonFile(filePath);
            this.commit('editor/setState', state);
        }
    },
    async save(context) {
        const dataDirectory = context.rootState.config.dataDirectory;
        const filePath = path.join(dataDirectory, 'state.json');

        await writeJsonFile(filePath, state);
    }
};

const mutations: MutationTree<EditorState> = {
    toggleMode: (s, p) => (s.mode = s.mode === 'edit' ? 'view' : 'edit'),
    setState: (state, config) => Object.assign(state, config),
    update: (state, kv: { key: string; value: any }) => ((state as any)[kv.key] = kv.value)
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
