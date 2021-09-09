import { Tag, TAG_NAME_MAX_LENGTH } from '@/features/tags/shared/tag';
import { isBlank } from '@/shared/utils';
import { caseInsensitiveCompare } from '@/shared/utils/string/case-insensitive-compare';
import { generateId } from '@/store';
import { UndoPayload, VoidUndoPayload } from '@/store/plugins/undo';
import { Mutation, MutationTree } from 'vuex';
import { Mutations } from 'vuex-smart-module';
import { TagState } from './state';

export class TagMutations extends Mutations<TagState> {
    SET_STATE(s: TagState) {
        Object.assign(this.state, s);
    }

    CREATE(p: UndoPayload<Pick<Tag, 'id' | 'name'>>) {
        if (isBlank(p.value.id)) {
            throw Error('Tag id is required.');
        }

        if (isBlank(p.value.name)) {
            throw Error('Tag value is required.');
        }

        if (p.value.name.length > TAG_NAME_MAX_LENGTH) {
            throw Error(`Tag value must be ${TAG_NAME_MAX_LENGTH} characters or less.`);
        }

        this.state.values.push({
            id: p.value.id,
            name: p.value.name
        });
    }

    SET_NAME({ value: { tag, newName } }: UndoPayload<{ tag: Tag; newName: string }>) {
        if (isBlank(newName)) {
            throw Error('Value is required.');
        }

        if (newName.length > TAG_NAME_MAX_LENGTH) {
            throw Error(`Tag value must be ${TAG_NAME_MAX_LENGTH} characters or less.`);
        }

        // console.log('set name! tag: ', tag, ' new name: ', newName);
        tag.name = newName;
    }

    DELETE({ value: id }: UndoPayload<string>) {
        const i = this.state.values.findIndex((t) => t.id === id);

        if (i === -1) {
            throw Error(`No tag with id ${id} found.`);
        }

        this.state.values.splice(i, 1);
    }

    DELETE_ALL(payload: VoidUndoPayload) {
        this.state.values.length = 0;
    }

    SORT() {
        this.state.values.sort(caseInsensitiveCompare((v) => v.name));
    }
}
