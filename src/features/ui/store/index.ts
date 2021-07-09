import { UserInterfaceState } from './state';
import { UserInterfaceGetters } from './getters';
import { UserInterfaceActions } from './actions';
import { UserInterfaceMutations } from './mutations';
import { persist } from '@/store/plugins/persist/persist';
import { Module } from 'vuex-smart-module';
import { globalNavigation } from '@/features/ui/store/modules/global-navigation';

export const userInterface = new Module({
    namespaced: true,
    state: UserInterfaceState,
    getters: UserInterfaceGetters,
    mutations: UserInterfaceMutations,
    actions: UserInterfaceActions,
    modules: {
        globalNavigation
    }
});

persist.register({
    namespace: 'ui',
    fileName: 'ui.json',
    initMutation: 'SET_STATE',
    reviver: (s) => {
        /*
        * These are written verbose intentionally. Smaller granular checks
        * let us check for more edge cases.
        */

        s.globalNavigation ??= {};
        s.globalNavigation.notebooks ??= {};
        s.globalNavigation.notebooks.input = {};
        s.globalNavigation.tags ??= {};
        s.globalNavigation.tags.input = {};

        s.localNavigation ??= {}
        s.localNavigation.notes ??= {}
        s.localNavigation.notes.input = {};

        s.editor ??= {};
        s.editor.mode ??= 'view';

        return s;
    },
    transformer: (s) => {
        if (s.globalNavigation?.notebooks != null) {
            delete s.globalNavigation.notebooks.input;
            delete s.globalNavigation.notebooks.dragging;
        }

        if (s.globalNavigation?.tags != null) {
            delete s.globalNavigation.tags.input;
        }

        if (s.localNavigation?.notes != null) {
            delete s.localNavigation.notes.input;
        }

        delete s.cursor;

        if (s.editor?.tabs != null) {
            delete s.editor.tabs.dragging;

            for (let i = 0; i < s.editor?.tabs.values.length; i++) {
                delete s.editor.tabs.values[i].tagDropdownActive;
                delete s.editor.tabs.values[i].notebookDropdownActive;
            }
        }

        return s;
    }
});
