import { Note } from '@/features/notes/common/note';
import { Tag } from '@/features/tags/common/tag';
import { Getters } from 'vuex-smart-module';
import { TagState } from './state';

export class TagGetters extends Getters<TagState> {
    tagsForNote(note: Note) {
        if (note == null) {
            return [];
        }

        return this.state.values.filter((t) => note.tags.some((tagId) => t.id === tagId));
    }

    byName(name: string): Tag | undefined;
    byName(name: string, opts: { required: true }): Tag;
    byName(name: string, opts: { required?: boolean } = {}) {
        const tag = this.state.values.find((t) => t.value === name);

        if (opts.required && tag == null) {
            throw Error(`No tag with name ${name} found.`);
        }

        return tag;
    }

    byId(id: string): Tag | undefined;
    byId(id: string, opts: { required: true }): Tag;
    byId(id: string, opts: { required?: boolean } = {}) {
        const tag = this.state.values.find((t) => t.id === id);

        if (opts.required && tag == null) {
            throw Error(`No tag with id ${id} found.`);
        }

        return tag;
    }
}
