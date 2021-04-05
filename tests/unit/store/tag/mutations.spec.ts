import { mutations } from '@/store/modules/tags/mutations';
import { TagState } from '@/store/modules/tags/state';

describe('TagStore Mutations', () => {
    let state: TagState = null!;

    beforeEach(() => {
        state = {
            tags: []
        };
    });

    describe('CREATE()', () => {
        it('sets value', () => {
            mutations.CREATE(state, { value: 'cat' });
            expect(state.tags[0].value).toBe('cat');
        });

        it('generates id for tag when none passed', () => {
            mutations.CREATE(state, { value: 'cat' });
            expect(state.tags[0].id).toBeTruthy();
        });

        it('assigns id if passed', () => {
            mutations.CREATE(state, { id: '1', value: 'cat' });
            expect(state.tags[0].id).toBe('1');
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

            expect(state.tags[0].value).toBe('cat2');
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
            expect(state.tags).toHaveLength(0);
        });
    });
});
