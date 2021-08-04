import { Tag } from '@/features/tags/common/tag';
import { isBlank } from '@/shared/utils';
import { caseInsensitiveSorter } from '@/shared/utils/string/case-insensitive-sorter';
import { generateId } from '@/store';
import { UndoPayload } from '@/store/plugins/undo';
import { Mutation, MutationTree } from 'vuex';
import { Mutations } from 'vuex-smart-module';
import { TagState } from './state';

export class TagMutations extends Mutations<TagState> {
    SET_STATE(s: TagState) {
        Object.assign(this.state, s);
    }

    CREATE(p: UndoPayload<Pick<Tag, 'id' | 'value'>>) {
        if (isBlank(p.value.id)) {
            throw Error('Tag id is required.');
        }

        if (isBlank(p.value.value)) {
            throw Error('Tag value is required.');
        }

        this.state.values.push({
            id: p.value.id,
            value: p.value.value
        });
    }

    SET_NAME({ value: { tag, newName } }: UndoPayload<{ tag: Tag; newName: string }>) {
        if (newName == null) {
            throw Error('Value is required.');
        }

        // console.log('set name! tag: ', tag, ' new name: ', newName);
        tag.value = newName;
    }

    DELETE({ value: id }: UndoPayload<string>) {
        const i = this.state.values.findIndex((t) => t.id === id);

        if (i === -1) {
            throw Error(`No tag with id ${id} found.`);
        }

        this.state.values.splice(i, 1);
    }

    SORT() {
        this.state.values.sort(caseInsensitiveSorter((v) => v.value));
    }
}
