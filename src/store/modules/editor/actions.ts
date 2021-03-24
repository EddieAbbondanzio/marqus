import { State } from '@/store/store';
import { doesFileExist, loadJsonFile, writeJsonFile } from '@/utils/file-utils';
import path from 'path';
import { ActionTree } from 'vuex';
import { EditorState, state } from './state';

const STATE_FILE_NAME = 'state.json';

export const actions: ActionTree<EditorState, State> = {
    async load(context) {
        const dataDirectory = context.rootState.config.dataDirectory;
        const filePath = path.join(dataDirectory, STATE_FILE_NAME);

        if (doesFileExist(filePath)) {
            const state = await loadJsonFile(filePath);
            this.commit('editor/SET_STATE', state);
        }
    },
    async save(context) {
        const dataDirectory = context.rootState.config.dataDirectory;
        const filePath = path.join(dataDirectory, STATE_FILE_NAME);

        await writeJsonFile(filePath, state);
    }
};
