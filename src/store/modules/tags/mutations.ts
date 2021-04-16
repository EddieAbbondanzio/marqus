import { type } from 'node:os';
import { Mutation, MutationTree } from 'vuex';
import { TagState } from './state';
import { id as generateId } from '@/utils/id';

export const mutations: MutationTree<TagState> = {
    CREATE(state, { id, value }: { id?: string; value: string }) {
        if (value == null) {
            throw Error('Value is required.');
        }

        state.values.push({
            id: id ?? generateId(),
            value: value
        });
    },
    UPDATE(state, { id, value }: { id: string; value: string }) {
        const t = state.values.find((t) => t.id === id);

        if (t == null) {
            throw Error(`No tag with id: ${id} found.`);
        }

        if (value == null) {
            throw Error('Value is required.');
        }

        t.value = value;
    },
    DELETE(state, id: string) {
        const i = state.values.findIndex((t) => t.id === id);

        if (i === -1) {
            throw Error(`No tag with id: ${id} found.`);
        }

        state.values.splice(i, 1);
    },
    SORT(s) {
        s.values.sort((a, b) => a.value.localeCompare(b.value));
    }
};
