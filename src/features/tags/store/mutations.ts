import { generateId } from '@/store';
import { isBlank } from '@/utils/string/is-blank';
import { Mutation, MutationTree } from 'vuex';
import { TagState } from './state';

export const mutations: MutationTree<TagState> = {
    SET_STATE(state, s: TagState) {
        Object.assign(state, s);
    },
    CREATE(state, props: { id?: string; value: string }) {
        if (isBlank(props.value)) {
            throw Error('Tag names cannot be empty.');
        }

        state.values.push({
            id: props.id ?? generateId(),
            value: props.value
        });
    },
    SET_NAME(state, { id, value }: { id: string; value: string }) {
        const t = state.values.find((t) => t.id === id);

        if (t == null) {
            throw Error(`No tag with id: ${id} found.`);
        }

        if (value == null) {
            throw Error('Value is required.');
        }

        t.value = value;
    },
    DELETE(state, { id }: { id: string }) {
        const i = state.values.findIndex((t) => t.id === id);

        if (i === -1) {
            throw Error(`No tag with id: ${id} found.`);
        }

        state.values.splice(i, 1);
    },
    SORT(state) {
        state.values.sort((a, b) => a.value.localeCompare(b.value));
    }
};
