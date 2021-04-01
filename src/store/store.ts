import { createStore, useStore as baseUseStore, Store, ActionTree } from 'vuex';
import config from '@/store/modules/config/config';
import { createDirectory, doesFileExist } from '@/utils/file-utils';
import app from '@/store/modules/app';

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
    strict: process.env.NODE_ENV !== 'production' // Major performance hit in prod see: https://next.vuex.vuejs.org/guide/strict.html#development-vs-production
});

store.subscribe((m, s) => {
    // Trigger save to file whenever we modify state
    if (m.type.startsWith('editor')) {
        store.dispatch('app/save');
    }
});
