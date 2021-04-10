import { state } from './state';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import globalNavigation from '@/store/modules/app/modules/global-navigation/';

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
    modules: {
        globalNavigation
    }
};
