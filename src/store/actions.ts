import { doesFileExist, createDirectory } from '@/utils/file-utils';
import { ActionTree } from 'vuex';
import { State } from './state';

export const actions: ActionTree<State, any> = {
    startup: function(c) {
        // Create data directory if needed.
        if (!doesFileExist(c.state.config.dataDirectory)) {
            createDirectory(c.state.config.dataDirectory);
        }

        c.dispatch('config/load');
        // c.dispatch('app/load');
    }
};
