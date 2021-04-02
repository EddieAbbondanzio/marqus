import { createStore, useStore as baseUseStore, Store, ActionTree } from 'vuex';
import config from '@/store/modules/config/config';
import { createDirectory, doesFileExist } from '@/utils/file-utils';
import app from '@/store/modules/app';
import { PersistPlugin } from './persist-plugin/persist-plugin';

export interface State {
    count: number;
    config: any;
    app: any;
}

const actions: ActionTree<State, any> = {
    startup: function(c) {
        // Create data directory if needed.
        if (!doesFileExist(c.state.config.dataDirectory)) {
            createDirectory(c.state.config.dataDirectory);
        }

        c.dispatch('config/load');
        c.dispatch('app/load');
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
        app
    },
    plugins: [PersistPlugin],
    strict: process.env.NODE_ENV !== 'production' // Major performance hit in prod see: https://next.vuex.vuejs.org/guide/strict.html#development-vs-production
});
