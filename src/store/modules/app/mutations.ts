import { id } from '@/utils/id';
import { MutationTree } from 'vuex';
import { Notebook } from '../notebooks/state';
import { AppState } from './state';

export const mutations: MutationTree<AppState> = {
    // OLD
    UPDATE_STATE: (state, kv: { key: string; value: any }) => {
        // i = 'a.b.c' -> a['a']['b']['c'] = v
        const recurse = (a: any, i: string, v: any) => {
            if (i.indexOf('.') < 0) {
                a[i] = v;
                return;
            }

            const split = i.split('.');
            const localI = split.shift()!;
            recurse(a[localI], split.join('.'), v);
        };

        recurse(state, kv.key, kv.value);
    },

    SET_CURSOR_TITLE(state, title: string) {
        state.cursor.title = title;
    },
    CLEAR_CURSOR_TITLE(state) {
        state.cursor.title = undefined;
    },
    SET_CURSOR_ICON(state, icon: string) {
        state.cursor.icon = icon;
    },
    RESET_CURSOR_ICON(state) {
        state.cursor.icon = 'pointer';
    }
};
