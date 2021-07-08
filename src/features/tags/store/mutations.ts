import { isBlank } from '@/shared/utils';
import { generateId } from '@/store';
import { Mutation, MutationTree } from 'vuex';
import { Mutations } from 'vuex-smart-module';
import { TagState } from './state';

export class TagMutations extends Mutations<TagState> {
    SET_STATE(s: TagState) {
        Object.assign(this.state, s);
    }

    CREATE(props: { id?: string; value: string }) {
        if (isBlank(props.value)) {
            throw Error('Tag names cannot be empty.');
        }

        this.state.values.push({
            id: props.id ?? generateId(),
            value: props.value
        });
    }

    SET_NAME({ id, value }: { id: string; value: string }) {
        const t = this.state.values.find((t) => t.id === id);

        if (t == null) {
            throw Error(`No tag with id: ${id} found.`);
        }

        if (value == null) {
            throw Error('Value is required.');
        }

        t.value = value;
    }

    DELETE({ id }: { id: string }) {
        const i = this.state.values.findIndex((t) => t.id === id);

        if (i === -1) {
            throw Error(`No tag with id: ${id} found.`);
        }

        this.state.values.splice(i, 1);
    }

    SORT() {
        this.state.values.sort((a, b) => a.value.localeCompare(b.value));
    }
}
