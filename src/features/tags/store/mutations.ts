import { isBlank } from '@/shared/utils';
import { generateId } from '@/store';
import { UndoPayload } from '@/store/plugins/undo';
import { Mutation, MutationTree } from 'vuex';
import { Mutations } from 'vuex-smart-module';
import { TagState } from './state';

export class TagMutations extends Mutations<TagState> {
    SET_STATE(s: TagState) {
        Object.assign(this.state, s);
    }

    CREATE(p: UndoPayload<{ id?: string; value: string }>) {
        if (isBlank(p.value.value)) {
            throw Error('Tag names cannot be empty.');
        }

        this.state.values.push({
            id: p.value.id ?? generateId(),
            value: p.value.value
        });
    }

    SET_NAME(p: UndoPayload<{ id: string; value: string }>) {
        const t = this.state.values.find((t) => t.id === p.value.id);

        if (t == null) {
            throw Error(`No tag with id: ${p.value.id} found.`);
        }

        if (p.value.value == null) {
            throw Error('Value is required.');
        }

        t.value = p.value.value;
    }

    DELETE(p: UndoPayload<{ id: string }>) {
        const i = this.state.values.findIndex((t) => t.id === p.value.id);

        if (i === -1) {
            throw Error(`No tag with id: ${p.value.id} found.`);
        }

        this.state.values.splice(i, 1);
    }

    SORT() {
        this.state.values.sort((a, b) => a.value.localeCompare(b.value));
    }
}
