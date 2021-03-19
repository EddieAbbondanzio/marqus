import { doesFileExist, loadJsonFile, writeJsonFile } from '@/utils/load-json-file';
import { ActionTree, Module, MutationTree } from 'vuex';
import { State } from '../../store';

const state = {
    dataDirectory: 'data'
};

export type ConfigState = typeof state;

const getters = {};

const actions: ActionTree<ConfigState, State> = {
    async load({ commit }) {
        const path = 'config.json';

        if (await doesFileExist(path)) {
            const config = await loadJsonFile(path);
            commit('applyLoadedConfig', config);
        } else {
            await writeJsonFile(path, state);
        }
    },
    async save() {
        const path = 'config.json';
        await writeJsonFile(path, state);
    }
};

const mutations: MutationTree<ConfigState> = {
    applyLoadedConfig: (state, config) => Object.assign(state, config),
    update: (state, kv: { key: string; value: any }) => ((state as any)[kv.key] = kv.value)
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
} as Module<ConfigState, State>;
