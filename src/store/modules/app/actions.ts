import { DATA_DIRECTORY, State } from '@/store/state';
import { fileSystem } from '@/utils/file-system';
import path from 'path';
import { ActionTree } from 'vuex';
import { AppState, state } from './state';

const FILE_NAME = 'app.json';

export const actions: ActionTree<AppState, State> = {
    async load({ commit }) {
        const filePath = path.join(DATA_DIRECTORY, FILE_NAME);

        // If there is an app state file, load it.
        if (fileSystem.exists(filePath)) {
            const appState: AppState = await fileSystem.readJSON(filePath);

            // Init a few values (we delete these when saving to file)
            appState.globalNavigation.notebooks.input = {};
            appState.globalNavigation.tags.input = {};
            appState.localNavigation.notes.input = {};

            commit('STATE', appState);
        }
    }
};
