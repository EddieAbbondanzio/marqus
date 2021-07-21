import { TagActions } from '@/features/tags/store/actions';
import { TagGetters } from '@/features/tags/store/getters';
import { TagMutations } from '@/features/tags/store/mutations';
import { TagState } from '@/features/tags/store/state';
import { persist } from '@/store/plugins/persist/persist';
import { undo } from '@/store/plugins/undo';
import { Module } from 'vuex-smart-module';

export const tags = new Module({
    namespaced: true,
    state: TagState,
    getters: TagGetters,
    mutations: TagMutations,
    actions: TagActions
});

persist.register({
    namespace: 'tags',
    fileName: 'tags.json',
    initMutation: 'SET_STATE'
});
