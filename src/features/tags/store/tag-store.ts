import { Note } from '@/features/notes/common/note';
import { Tag } from '@/features/tags/common/tag';
import { isBlank } from '@/shared/utils';
import { persist, store } from '@/store';
import { Getter, Module, Mutation } from '@/store/common/class-modules/decorators';
import { registerModule } from '@/store/common/class-modules/register-module';
import { VuexModule } from '@/store/common/class-modules/vuex-module';
import { generateId } from '@/store/common/types/entity';
import { State } from '@/store/state';
import { Store } from 'vuex';

export interface TagState {
    values: Tag[];
}

export const state: TagState = {
    values: []
};

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
    CREATE(props: { id?: string; value: string }) {
        console.log('CREATE tag');
        if (isBlank(props.value)) {
            throw Error('Tag names cannot be empty.');
        }

        this.state.values.push({
            id: props.id ?? generateId(),
            value: props.value
        });
    }

    @Mutation()
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

    @Mutation()
    DELETE({ id }: { id: string }) {
        const i = this.state.values.findIndex((t) => t.id === id);

        if (i === -1) {
            throw Error(`No tag with id: ${id} found.`);
        }

        this.state.values.splice(i, 1);
    }

    @Mutation()
    SORT() {
        this.state.values.sort((a, b) => a.value.localeCompare(b.value));
    }
}

export const tagStore = registerModule<TagStore>(TagStore, store);

persist.register({
    namespace: 'tags',
    fileName: 'tags.json',
    initMutation: 'SET_STATE'
});
