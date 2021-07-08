import { TagStore } from '@/features/tags/store/tag-store';

describe('TagStore', () => {
    const store = new TagStore({} as any);

    beforeEach(() => {
        store.state.values.length = 0;
    });

    describe('CREATE()', () => {
        it('sets value', () => {
            const tag = store.CREATE({
                value: 'foo'
            });

            expect(tag.value).toBe('foo');
        });

        it('sets id for tag when none passed', () => {
            const tag = store.CREATE({
                value: 'foo'
            });

            expect(tag.id).not.toBeNull();
        });

        it('throws if value is blank', () => {
            expect(() => {
                store.CREATE({
                    value: '       '
                });
            }).toThrow();
        });
    });

    describe('UPDATE_VALUE()', () => {
        it('throws error if no tag found.', () => {
            expect(() => {
                store.UPDATE_VALUE({ id: '1', value: 'cat' });
            }).toThrowError();
        });

        it('updates value', () => {
            const tag = store.CREATE({
                value: 'foo'
            });

            store.UPDATE_VALUE({ id: tag.id, value: 'bar' });
            expect(tag.value).toBe('bar');
        });

        it('throws if value is blank', () => {
            const tag = store.CREATE({
                value: 'foo'
            });

            expect(() => {
                store.UPDATE_VALUE({
                    id: tag.id,
                    value: '       '
                });
            }).toThrow();
        });
    });

    describe('DELETE()', () => {
        it('throws error if no tag found.', () => {
            expect(() => {
                store.DELETE({ id: '1' });
            }).toThrowError();
        });

        it('deletes tag from state', () => {
            const tag1 = store.CREATE({
                value: 'foo'
            });

            const tag2 = store.CREATE({
                value: 'bar'
            });

            store.DELETE({ id: tag1.id });

            expect(store.state.values).toHaveLength(1);
        });
    });

    describe('TAGS_SORT', () => {
        it('sorts alphabetically', () => {
            const tag2 = store.CREATE({
                value: 'foo'
            });

            const tag1 = store.CREATE({
                value: 'bar'
            });

            store.SORT();

            expect(store.state.values[0]).toHaveProperty('value', 'bar');
            expect(store.state.values[1]).toHaveProperty('value', 'foo');
        });
        it('ignores case', () => {
            const tag2 = store.CREATE({
                value: 'FOO'
            });

            const tag1 = store.CREATE({
                value: 'bar'
            });

            store.SORT();

            expect(store.state.values[0]).toHaveProperty('value', 'bar');
            expect(store.state.values[1]).toHaveProperty('value', 'FOO');
        });
    });
});
