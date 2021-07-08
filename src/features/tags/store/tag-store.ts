import { Note } from '@/features/notes/common/note';
import { Tag } from '@/features/tags/common/tag';
import { TagState } from '@/features/tags/store/state';
import { isBlank } from '@/shared/utils';
import { store } from '@/store';
import { Getter, Module, Mutation } from '@/store/common/class-modules/decorators';
import { registerModule } from '@/store/common/class-modules/register-module';
import { VuexModule } from '@/store/common/class-modules/vuex-module';
import { generateId } from '@/store/common/types/entity';
import { persist } from '@/store/plugins/persist';
import { State } from '@/store/state';
import { Store } from 'vuex';

@Module({ namespace: 'tags' })
export class TagStore extends VuexModule {
    state: TagState;

    constructor(store: Store<State>) {
        super(store);

        this.state = {
            values: []
        };
    }

    @Getter()
    get tagsForNote() {
        return (note: Note) => {
            if (note == null) {
                return [];
            }

            return this.state.values.filter((t) => note.tags.some((tagId) => t.id === tagId));
        };
    }

    @Mutation()
    SET_STATE(s: TagState) {
        this.state = s;
    }

    @Mutation()
    CREATE({ value }: { value: string }): Readonly<Tag> {
        if (isBlank(value)) {
            throw Error('Value is required.');
        }

        const tag = {
            id: generateId(),
            value: value
        };

        this.state.values.push(tag);

        return tag;
    }

    @Mutation()
    UPDATE_VALUE({ id, value }: { id: string; value: string }): Readonly<Tag> {
        const t = this.state.values.find((t) => t.id === id);

        if (t == null) {
            throw Error(`No tag with id: ${id} found.`);
        }

        if (isBlank(value)) {
            throw Error('Value is required.');
        }

        t.value = value;
        return t;
    }

    @Mutation()
    DELETE({ id }: { id: string }): Readonly<Tag> {
        const i = this.state.values.findIndex((t) => t.id === id);

        if (i === -1) {
            throw Error(`No tag with id: ${id} found.`);
        }

        const [tag] = this.state.values.splice(i, 1);
        return tag;
    }

    @Mutation()
    SORT() {
        this.state.values.sort((a, b) => a.value.localeCompare(b.value));
    }
}

export const tagStore = registerModule<TagStore>(TagStore, store);

persist.register({
    namespace: 'tags',
    initMutation: 'SET_STATE'
});
