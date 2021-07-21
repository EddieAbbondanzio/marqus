import { mediator } from '@/store/plugins/mediator';
import { persist } from '@/store/plugins/persist';
import { createStore, Module } from 'vuex-smart-module';
import { notebooks } from '@/features/notebooks/store';
import { tags } from '@/features/tags/store';
import { shortcuts } from '@/features/shortcuts/store';
import { userInterface } from '@/features/ui/store';
import { notes } from '@/features/notes/store';
import { undo } from '@/store/plugins/undo';
import { createLogger } from 'vuex';

export const root = new Module({
    namespaced: false,
    modules: {
        notebooks,
        tags,
        shortcuts,
        notes,
        ui: userInterface
    }
});

export const store = createStore(root, {
    plugins: [createLogger({ logActions: false }), persist.plugin, mediator.plugin, undo.plugin],
    /*
     * Don't use strict mode in production.
     * Major performance hit.
     * See: https://next.vuex.vuejs.org/guide/strict.html#development-vs-production
     */
    strict: process.env.NODE_ENV !== 'production'
});

export * from './common/types/entity';
