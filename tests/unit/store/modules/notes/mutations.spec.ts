import notebooks from '@/store/modules/notebooks';
import { mutations } from '@/store/modules/notes/mutations';
import { NoteState } from '@/store/modules/notes/state';

describe('note mutations', () => {
    let state: NoteState = null!;

    beforeEach(() => {
        state = {
            values: []
        };
    });

    describe('CREATE()', () => {
        it('throws error if no name passed', () => {
            expect(() => {
                mutations.CREATE(state, {});
            }).toThrow();
        });

        it('generates id', () => {
            mutations.CREATE(state, { name: 'cat' });
            expect(state.values[0].id).not.toBeUndefined();
        });

        it('adds note to array', () => {
            mutations.CREATE(state, { name: 'cat' });
            expect(state.values[0].name).toBe('cat');
        });
    });

    describe('UPDATE()', () => {
        it('throws error if no note found', () => {
            expect(() => {
                mutations.UPDATE(state, { id: '1' });
            }).toThrow();
        });

        it('updates name', () => {
            state.values.push({
                id: '1',
                name: 'cat',
                notebooks: [],
                tags: [],
                dateCreated: new Date(),
                dateModified: new Date()
            });

            mutations.UPDATE(state, { id: '1', name: 'dog' });

            expect(state.values[0].name).toBe('dog');
        });
    });

    describe('DELETE()', () => {
        it('throws error if not found', () => {
            expect(() => {
                mutations.DELETE(state, { id: '1' });
            }).toThrow();
        });

        it('removes note from array', () => {
            state.values.push({
                id: '1',
                name: 'cat',
                notebooks: [],
                tags: [],
                dateCreated: new Date(),
                dateModified: new Date()
            });

            mutations.DELETE(state, '1');

            expect(state.values).toHaveLength(0);
        });
    });
});
