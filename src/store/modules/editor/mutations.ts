import { MutationTree } from 'vuex';
import { EditorState, Tag } from './state';
import { v4 as uuidv4 } from 'uuid';

export const mutations: MutationTree<EditorState> = {
    TOGGLE_MODE: (s, p) => (s.mode = s.mode === 'edit' ? 'view' : 'edit'),
    SET_STATE: (state, config) => Object.assign(state, config),
    UPDATE_STATE: (state, kv: { key: string; value: any }) => ((state as any)[kv.key] = kv.value),
    CREATE_TAG(state, name: string) {
        const t: Tag = {
            id: uuidv4(),
            value: name,
            expanded: false
        };

        // Check to ensure no other tag has same name
        const duplicate = state.tags.find((t) => t.value === name);
        if (t.id !== duplicate?.id) {
            throw new Error('Cannot have multiple tags with same name');
        }

        state.tags.push(t);
    },
    UPDATE_TAG(state, { id, name }: { id: string; name: string }) {
        const tag = state.tags.find((t) => t.id === id);

        if (tag == null) {
            throw new Error(`No tag found with id: ${id}`);
        }

        // Check to ensure no other tag has same name
        const duplicate = state.tags.find((t) => t.value === name);
        if (tag.id !== duplicate?.id) {
            throw new Error('Cannot have multiple tags with same name');
        }

        tag.value = name;
    },
    DELETE_TAG(state, id) {
        const index = state.tags.findIndex((t) => t.id === id);

        if (index === -1) {
            throw new Error('No tag found');
        }

        state.tags.splice(index, 1);
    }
};
