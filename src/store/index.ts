import { createStore } from 'vuex';
import app from '@/modules/app/store';
import tags from '@/modules/tags/store';
import notebooks from '@/modules/notebooks/store';
import notes from '@/modules/notes/store';
import { State, state } from './state';
import { mutations } from '@/store/mutations';
import { actions } from '@/store/actions';
import { persist } from '../core/store/plugins/persist/persist';
import { mediator } from '@/core/store/plugins/mediator/mediator';
import shortcuts from '@/modules/shortcuts/store';
import { undo } from '@/core/store/plugins/undo/undo';

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
