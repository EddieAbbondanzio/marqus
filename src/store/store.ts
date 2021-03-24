import { createStore, useStore as baseUseStore, Store, ActionTree } from 'vuex';
import config from '@/store/modules/config/config';
import editor from '@/store/modules/editor/editor';
import { InjectionKey } from 'vue';
import { createDirectory, doesFileExist } from '@/utils/file-utils';
import { Menu, MenuItem } from 'electron';

export interface State {
    count: number;
    config: any;
    editor: any;
}

const actions: ActionTree<State, any> = {
    startup: function(c) {
        // Create data directory if needed.
        if (!doesFileExist(c.state.config.dataDirectory)) {
            createDirectory(c.state.config.dataDirectory);
        }

        c.dispatch('config/load');
        c.dispatch('editor/loadState');
    }
};

export const store = createStore<State>({
    state: {
        count: 1
    } as any,
    mutations: {},
    actions,
    modules: {
        config,
        editor
    },
    strict: process.env.NODE_ENV !== 'production' // Major performance hit in prod see: https://next.vuex.vuejs.org/guide/strict.html#development-vs-production
});
