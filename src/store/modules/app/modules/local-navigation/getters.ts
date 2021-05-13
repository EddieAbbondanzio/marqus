import { State } from '@/store/state';
import { GetterTree } from 'vuex';
import { LocalNavigation } from './state';

export const getters: GetterTree<LocalNavigation, State> = {
    isNoteBeingCreated: (s) => s.notes.input?.mode === 'create',
    isNoteBeingUpdated: (s) => (id: string) => {
        return s.notes.input.mode === 'update' && s.notes.input.id === id;
    },
    activeNotes: (state, getters, rootState) => {
        const active = rootState.app.globalNavigation.active;

        if (active == null) {
            return [];
        }

        // Handle string cases
        switch (active) {
            case 'all':
                return rootState.notes.values;
            case 'favorites':
                return []; // TODO: Implement this.
            case 'trash':
                return []; // TODO: Implement this.
        }

        // Handle object cases
        switch (active.type) {
            case 'notebook':
                return rootState.notes.values.find((note) => note.notebooks.some((nb) => nb === active.id));
            case 'tag':
                return rootState.notes.values.find((note) => note.tags.some((tag) => tag === active.id));
        }
    }
};
