import { createStore } from 'vuex';
import app from '@/store/modules/app';
import tags from '@/store/modules/tags';
import notebooks from '@/store/modules/notebooks';
import notes from '@/store/modules/notes';
import { State, state } from './state';
import { mutations } from '@/store/mutations';
import { actions } from '@/store/actions';
import { persist } from './plugins/persist/persist';
import { mediator } from '@/store/plugins/mediator/mediator';
import shortcuts from '@/store/modules/shortcuts';

export const store = createStore<State>({
    state: () => state as any,
    mutations,
    actions,
    modules: {
        app,
        notebooks,
        tags,
        notes,
        shortcuts
    },
    plugins: [persist.plugin, mediator.plugin],
    /*
     * Don't use strict mode in production.
     * Major performance hit.
     * See: https://next.vuex.vuejs.org/guide/strict.html#development-vs-production
     */
    strict: process.env.NODE_ENV !== 'production'
});
