import { doesFileExist, loadJsonFile, writeJsonFile } from '@/utils/load-json-file';
import { ActionTree, Module, MutationTree } from 'vuex';
import { State } from '../../store';

const state = {
    ['window.globalNavigation.width' as string]: '300px',
    ['window.localNavigation.width' as string]: '300px',
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
    applyLoadedConfig(state, config) {
        state['window.globalNavigation.width'] = config['window.globalNavigation.width'];
        state['window.localNavigation.width'] = config['window.localNavigation.width'];
        state['dataDirectory'] = config['dataDirectory'];
    },
    updateConfig(state, kv: { key: string; value: any }) {
        state[kv.key] = kv.value;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
} as Module<ConfigState, State>;
