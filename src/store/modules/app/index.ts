import { state } from './state';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import globalNavigation from '@/store/modules/app/modules/global-navigation/';
import localNavigation from '@/store/modules/app/modules/local-navigation/';
import { persist } from '@/store/plugins/persist/persist';

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
    modules: {
        globalNavigation,
        localNavigation
    }
};

persist.register({
    namespace: 'app',
    fileName: 'app.json',
    initiMutation: 'INIT',
    reviver: (s) => {
        s.globalNavigation.notebooks.input = {};
        s.globalNavigation.tags.input = {};
        s.localNavigation.notes.input = {};

        return s;
    },
    transformer: (s) => {
        delete s.globalNavigation.notebooks.input;
        delete s.globalNavigation.tags.input;
        delete s.localNavigation.notes.input;

        return s;
    }
});
