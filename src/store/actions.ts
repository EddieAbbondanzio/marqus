import { doesPathExist, createDirectory, loadJsonFile, writeJsonFile } from '@/utils/file-utils';
import path from 'path';
import { ActionTree } from 'vuex';
import { State } from './state';

const STATE_FILE_NAME = 'state.json';

const saving: { current?: Promise<any>; next?: () => Promise<any> } = {};

export const actions: ActionTree<State, any> = {
    startup: function(c) {
        // Create data directory if needed.
        if (!doesPathExist(c.state.config.dataDirectory)) {
            createDirectory(c.state.config.dataDirectory);
        }

        c.dispatch('config/load');
        c.dispatch('app/globalNavigation/refresh');
        c.dispatch('load');
    },
    async load(context) {
        const dataDirectory = context.rootState.config.dataDirectory;
        const filePath = path.join(dataDirectory, STATE_FILE_NAME);

        if (doesPathExist(filePath)) {
            const state = await loadJsonFile(filePath);
            this.commit('STATE', state);
        }
    },
    async save(context) {
        const dataDirectory = context.rootState.config.dataDirectory;
        const filePath = path.join(dataDirectory, STATE_FILE_NAME);

        // Deep copy so we can purge some data without effecting vuex
        const state = JSON.parse(JSON.stringify(context.state));

        if (state.globalNavigation?.notebooks) {
            state.globalNavigation.notebooks.dragging = undefined;
        }

        /*
         * There be dragons here. This is written in a way to prevent a
         * race condition from occuring when writing the file. Race conditions
         * will corrupt the JSON because more than 1 process is writing the
         * file at the same time causing for overlaps, etc.
         */

        if (saving.current == null) {
            saving.current = writeJsonFile(filePath, state);
            context.commit('CLEAN');
        } else if (saving.next == null) {
            saving.next = () => writeJsonFile(filePath, state);
        }

        // Save current
        await saving.current;
        delete saving.current;

        // Save next, if needed
        if (saving.next != null) {
            saving.next();
            delete saving.next;
        }
    }
};
