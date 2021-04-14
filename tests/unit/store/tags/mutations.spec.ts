import { mutations } from '@/store/modules/tags/mutations';
import { TagState } from '@/store/modules/tags/state';
import { id } from '@/utils/id';

describe('TagStore Mutations', () => {
    let state: TagState = null!;

    beforeEach(() => {
        state = {
            values: []
        };
    });

    describe('CREATE()', () => {
        it('sets value', () => {
            mutations.CREATE(state, { value: 'cat' });
            expect(state.values[0].value).toBe('cat');
        });

        it('generates id for tag when none passed', () => {
            mutations.CREATE(state, { value: 'cat' });
            expect(state.values[0].id).toBeTruthy();
        });

        it('assigns id if passed', () => {
            mutations.CREATE(state, { id: '1', value: 'cat' });
            expect(state.values[0].id).toBe('1');
        });
    });

    describe('UPDATE()', () => {
        it('throws error if no tag found.', () => {
            expect(() => {
                mutations.UPDATE(state, { id: '1', value: 'cat' });
            }).toThrowError();
        });

        it('updates value', () => {
            mutations.CREATE(state, { id: '1', value: 'cat' });
            mutations.UPDATE(state, { id: '1', value: 'cat2' });

            expect(state.values[0].value).toBe('cat2');
        });
    });

    describe('DELETE()', () => {
        it('throws error if no tag found.', () => {
            expect(() => {
                mutations.DELETE(state, '1');
            }).toThrowError();
        });

        it('deletes tag from state', () => {
            mutations.CREATE(state, { id: '1', value: 'cat' });
            mutations.DELETE(state, '1');
            expect(state.values).toHaveLength(0);
        });
    });

    describe('TAGS_SORT', () => {
        it('sorts alphabetically', () => {
            state.values.push({ id: id(), value: 'b' }, { id: id(), value: 'c' }, { id: id(), value: 'a' });
            mutations.TAGS_SORT(state);

            expect(state.values[0].value).toBe('a');
            expect(state.values[1].value).toBe('b');
            expect(state.values[2].value).toBe('c');
        });

        it('ignores case', () => {
            state.values.push({ id: id(), value: 'B' }, { id: id(), value: 'C' }, { id: id(), value: 'a' });
            mutations.TAGS_SORT(state);

            expect(state.values[0].value).toBe('a');
            expect(state.values[1].value).toBe('B');
            expect(state.values[2].value).toBe('C');
        });
    });
});
