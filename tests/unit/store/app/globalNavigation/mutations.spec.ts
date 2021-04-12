import { mutations } from '@/store/modules/app/modules/global-navigation/mutations';
import { GlobalNavigation } from '@/store/modules/app/modules/global-navigation/state';
import { id } from '@/utils/id';

describe('GlobalNavigation mutations', () => {
    let state: GlobalNavigation;

    beforeEach(() => {
        state = {
            notebooks: {
                expanded: false,
                input: {},
                entries: []
            },
            tags: {
                expanded: false,
                input: {},
                entries: []
            },
            width: '100px'
        };
    });

    describe('TAGS_EXPANDED', () => {
        it('assigns tags.expanded to the parameter.', () => {
            mutations.TAGS_EXPANDED(state, true);
            expect(state.tags.expanded).toBeTruthy();
        });

        it('defaults to true', () => {
            mutations.TAGS_EXPANDED(state);
            expect(state.tags.expanded).toBeTruthy();
        });
    });

    describe('TAGS_SORT', () => {
        it('sorts alphabetically', () => {
            state.tags.entries.push({ id: id(), value: 'b' }, { id: id(), value: 'c' }, { id: id(), value: 'a' });
            mutations.TAGS_SORT(state);

            expect(state.tags.entries[0].value).toBe('a');
            expect(state.tags.entries[1].value).toBe('b');
            expect(state.tags.entries[2].value).toBe('c');
        });

        it('ignores case', () => {
            state.tags.entries.push({ id: id(), value: 'B' }, { id: id(), value: 'C' }, { id: id(), value: 'a' });
            mutations.TAGS_SORT(state);

            expect(state.tags.entries[0].value).toBe('a');
            expect(state.tags.entries[1].value).toBe('B');
            expect(state.tags.entries[2].value).toBe('C');
        });
    });

    describe('TAGS_REFRESH', () => {
        it('updates value of existing tags', () => {
            const entry = {
                id: id(),
                value: 'cat'
            };

            const updatedTag = {
                id: entry.id,
                value: 'dog'
            };

            state.tags.entries.push(entry);

            mutations.TAGS_REFRESH(state, [updatedTag]);
            expect(state.tags.entries[0].value).toBe('dog');
        });

        it('removes existing if no longer a tag', () => {
            const entry = {
                id: id(),
                value: 'cat'
            };

            mutations.TAGS_REFRESH(state, []);
            expect(state.tags.entries).toHaveLength(0);
        });

        it('adds new tags', () => {
            const tag = {
                id: id(),
                value: 'dog'
            };

            mutations.TAGS_REFRESH(state, [tag]);
            expect(state.tags.entries[0].value).toBe('dog');
        });
    });

    describe('TAG_INPUT_VALUE', () => {
        it('sets value', () => {
            mutations.TAG_INPUT_VALUE(state, 'cat');
            expect(state.tags.input.value).toBe('cat');
        });
    });

    describe('TAG_INPUT_START', () => {
        it('sets mode to create when no id passed', () => {
            mutations.TAG_INPUT_START(state);
            expect(state.tags.input.mode).toBe('create');
        });

        it('sets id when in create mode', () => {
            mutations.TAG_INPUT_START(state);
            expect(state.tags.input.id).toBeTruthy();
        });

        it('sets mode to update when id passed', () => {
            const t = {
                id: id(),
                value: 'Cat'
            };

            state.tags.entries.push(t);
            mutations.TAG_INPUT_START(state, t.id);
            expect(state.tags.input.mode).toBe('update');
        });

        it('sets id when in update mode', () => {
            const t = {
                id: id(),
                value: 'Cat'
            };

            state.tags.entries.push(t);
            mutations.TAG_INPUT_START(state, t.id);
            expect(state.tags.input.id).toBe(t.id);
        });
    });

    describe('TAG_INPUT_CLEAR', () => {
        it('clears input out', () => {
            state.tags.input = {
                id: id(),
                value: 'Cat'
            };

            mutations.TAG_INPUT_CLEAR(state);
            expect(state.tags.input.id).toBeUndefined();
            expect(state.tags.input.value).toBeUndefined();
            expect(state.tags.input.mode).toBeUndefined();
        });
    });

    describe('TAG_DELETE', () => {
        it('removes tag', () => {
            const t = {
                id: id(),
                value: 'Cat'
            };

            state.tags.entries.push(t);

            mutations.TAG_DELETE(state, state.tags.entries[0].id);
            expect(state.tags.entries).toHaveLength(0);
        });
    });
});
