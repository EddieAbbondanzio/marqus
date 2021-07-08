import { createLogger, createStore, mapState } from 'vuex';
import notebooks from '@/features/notebooks/store';
import notes from '@/features/notes/store';
import { State, state } from './state';
import { mutations } from '@/store/mutations';
import { actions } from '@/store/actions';
import { persist } from './plugins/persist/persist';
import { mediator } from '@/store/plugins/mediator/mediator';
import shortcuts from '@/features/shortcuts/store';

export const store = createStore<State>({
    state: () => state as any,
    mutations,
    actions,
    modules: {
        notebooks,
        // tags,
        notes,
        shortcuts
    },
    plugins: [persist.plugin, mediator.plugin, createLogger()],
    /*
     * Don't use strict mode in production.
     * Major performance hit.
     * See: https://next.vuex.vuejs.org/guide/strict.html#development-vs-production
     */
    strict: process.env.NODE_ENV !== 'production'
});

export * from './common/types/entity';
