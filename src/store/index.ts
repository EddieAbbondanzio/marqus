import { createStore } from 'vuex';
import app from '@/features/app/store';
import tags from '@/features/tags/store';
import notebooks from '@/features/notebooks/store';
import notes from '@/features/notes/store';
import { State, state } from './state';
import { mutations } from '@/store/mutations';
import { actions } from '@/store/actions';
import { persist } from './plugins/persist/persist';
import { mediator } from '@/store/plugins/mediator/mediator';
import shortcuts from '@/features/shortcuts/store';
import { undo } from '@/store/plugins/undo/undo';

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
    plugins: [persist.plugin, mediator.plugin, undo.plugin],
    /*
     * Don't use strict mode in production.
     * Major performance hit.
     * See: https://next.vuex.vuejs.org/guide/strict.html#development-vs-production
     */
    strict: process.env.NODE_ENV !== 'production'
});

export * from './entity';
