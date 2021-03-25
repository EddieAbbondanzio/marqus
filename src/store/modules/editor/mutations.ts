import { id } from '@/utils/id';
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
        state.globalNavigation.tags.create = {
            id: id(),
            value: '',
            expanded: false
        };

        state.globalNavigation.tags.expanded = true;
    },
    CREATE_TAG_CONFIRM(state) {
        if (state.globalNavigation.tags.create == null) {
            throw new Error('No tag to create');
        }

        if (state.globalNavigation.tags.create.id == null || state.globalNavigation.tags.create.value == null) {
            throw new Error('Invalid tag data');
        }

        const t: Tag = {
            id: state.globalNavigation.tags.create.id,
            value: state.globalNavigation.tags.create.value,
            expanded: false
        };

        state.globalNavigation.tags.entries.push(t);
        state.globalNavigation.tags.create = null;
    },
    CREATE_TAG_CANCEL(state) {
        state.globalNavigation.tags.create = null;
    },
    UPDATE_TAG(state, { id, name }: { id: string; name: string }) {
        const tag = state.globalNavigation.tags.entries.find((t) => t.id === id);

        if (tag == null) {
            throw new Error(`No tag found with id: ${id}`);
        }

        // Check to ensure no other tag has same name
        const duplicate = state.globalNavigation.tags.entries.find((t) => t.value === name);
        if (tag.id !== duplicate?.id) {
            throw new Error('Cannot have multiple tags with same name');
        }

        tag.value = name;
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
