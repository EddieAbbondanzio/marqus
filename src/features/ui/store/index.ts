import { UserInterfaceState } from './state';
import { UserInterfaceGetters } from './getters';
import { UserInterfaceActions } from './actions';
import { UserInterfaceMutations } from './mutations';
import { persist } from '@/store/plugins/persist/persist';
import { Module } from 'vuex-smart-module';
import { globalNavigation } from '@/features/ui/store/modules/global-navigation';
import { localNavigation } from '@/features/ui/store/modules/local-navigation';
import { editor } from '@/features/ui/store/modules/editor';
import { GlobalNavigationState } from '@/features/ui/store/modules/global-navigation/state';
import { EditorState } from '@/features/ui/store/modules/editor/state';
import { LocalNavigationState } from '@/features/ui/store/modules/local-navigation/state';
import { RecursivePartial } from '@/shared/types/recursive-partial';

export const userInterface = new Module({
    namespaced: true,
    state: UserInterfaceState,
    getters: UserInterfaceGetters,
    mutations: UserInterfaceMutations,
    actions: UserInterfaceActions,
    modules: {
        globalNavigation,
        localNavigation,
        editor
    }
});

/**
 * Type to give us some compile time safety to help prevent errors in case
 * any property names are changed.
 */
export type PersistedUserInterfaceState = RecursivePartial<{
    globalNavigation: GlobalNavigationState, 
    localNavigation: LocalNavigationState
    editor: EditorState, 
} & UserInterfaceState>

persist.register({
    namespace: 'ui',
    fileName: 'ui.json',
    initMutation: 'SET_STATE',
    reviver: (s: PersistedUserInterfaceState) => {
        /*
        * These are intentionally written verbose. Smaller granular checks
        * let us catch more edge cases. We need to assume that the JSON
        * file may have been modified.
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
        s.editor.mode ??= 'readonly';
        s.editor.tabs ??= {}
        s.editor.tabs.values ??= []

        return s;
    },
    transformer: (s: PersistedUserInterfaceState) => {
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

        if (s.editor != null) {
            if (s.editor.tabs != null) {
                delete s.editor.tabs.dragging;

                if (s.editor.tabs.values != null) {
                for (const tab of s.editor.tabs.values) {
                    delete tab?.notebookDropdownVisible;
                    delete tab?.tagDropdownVisible;
                }
            }
            }
        }

        return s;
    }
});
