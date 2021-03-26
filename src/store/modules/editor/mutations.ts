import Vue from '*.vue';
import { id } from '@/utils/id';
import { ref } from 'vue';
import { MutationTree } from 'vuex';
import { EditorState, Tag } from './state';

export const mutations: MutationTree<EditorState> = {
    TOGGLE_MODE: (s, p) => (s.mode = s.mode === 'edit' ? 'view' : 'edit'),
    SET_STATE: (state, config) => {
        Object.assign(state, config);
    },
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
    CREATE_TAG(state) {
        state.globalNavigation.tags.input = {
            id: id(),
            value: '',
            expanded: false,
            mode: 'create'
        };

        state.globalNavigation.tags.expanded = true;
    },
    CREATE_TAG_CONFIRM(state) {
        if (state.globalNavigation.tags.input.value == null) {
            throw new Error('Invalid tag data');
        }

        const t: Tag = {
            id: id(),
            value: state.globalNavigation.tags.input.value,
            expanded: false
        };

        state.globalNavigation.tags.entries.push(t);
        state.globalNavigation.tags.input = {};
    },
    CREATE_TAG_CANCEL(state) {
        state.globalNavigation.tags.input = {};
    },
    UPDATE_TAG(state, id: string) {
        const tag = state.globalNavigation.tags.entries.find((t) => t.id === id);

        if (tag == null) {
            throw new Error(`No tag found with id: ${id}`);
        }

        state.globalNavigation.tags.input = { mode: 'update', ...tag };
    },
    UPDATE_TAG_CONFIRM(state) {
        if (state.globalNavigation.tags.input.value == null) {
            throw new Error('Invalid tag data');
        }

        const tag = state.globalNavigation.tags.entries.find((t) => t.id === state.globalNavigation.tags.input.id)!;
        tag.value = state.globalNavigation.tags.input.value;

        state.globalNavigation.tags.input = {};
    },
    UPDATE_TAG_CANCEL(state) {
        state.globalNavigation.tags.input = {};
    },
    DELETE_TAG(state, id) {
        const index = state.globalNavigation.tags.entries.findIndex((t) => t.id === id);

        if (index === -1) {
            throw new Error('No tag found');
        }

        state.globalNavigation.tags.entries.splice(index, 1);
    },
    DELETE_ALL_TAGS(state) {
        state.globalNavigation.tags.entries.length = 0;
    }
};
