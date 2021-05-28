import { state } from './state';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import globalNavigation from '@/store/modules/app/modules/global-navigation/';
import localNavigation from '@/store/modules/app/modules/local-navigation/';
import { persist } from '@/store/plugins/persist/persist';
import editor from '@/store/modules/app/modules/editor';
import { EventHistory } from '@/store/core/event-history';

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
    modules: {
        globalNavigation,
        localNavigation,
        editor
    }
};

persist.register({
    namespace: 'app',
    fileName: 'app.json',
    initMutation: 'INIT',
    reviver: (s) => {
        s.globalNavigation.notebooks.input = {};
        s.globalNavigation.tags.input = {};
        s.localNavigation.notes.input = {};

        if (s.editor.mode == null) {
            s.editor.mode = 'view';
        }

        if (s.localNavigation.history == null) {
            s.localNavigation.history = new EventHistory();
        } else {
            s.localNavigation.history = new EventHistory(
                s.localNavigation.history.events,
                s.localNavigation.history.currentIndex
            );
        }

        return s;
    },
    transformer: (s) => {
        delete s.globalNavigation.notebooks.input;
        delete s.globalNavigation.notebooks.dragging;
        delete s.globalNavigation.tags.input;

        delete s.localNavigation.notes.input;

        delete s.cursor;

        delete s.editor.tabs.dragging;

        for (let i = 0; i < s.editor.tabs.values.length; i++) {
            delete s.editor.tabs.values[i].tagDropdownActive;
            delete s.editor.tabs.values[i].notebookDropdownActive;
        }

        return s;
    }
});
