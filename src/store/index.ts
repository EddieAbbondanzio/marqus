import { createStore } from 'vuex';
import config from '@/store/modules/config/config';
import app from '@/store/modules/app';
import tags from '@/store/modules/tags';
import notebooks from '@/store/modules/notebooks';
import notes from '@/store/modules/notes';
import { PersistPlugin } from './plugins/persist/persist-plugin';
import { State, state } from './state';
import { mutations } from '@/store/mutations';
import { actions } from '@/store/actions';

export const store = createStore<State>({
    state: () => state as any,
    mutations,
    actions,
    modules: {
        app,
        config,
        notebooks,
        tags,
        notes
    },
    plugins: [PersistPlugin],
    /*
     * Don't use strict mode in production.
     * Major performance hit.
     * See: https://next.vuex.vuejs.org/guide/strict.html#development-vs-production
     */
    strict: process.env.NODE_ENV !== 'production'
});
