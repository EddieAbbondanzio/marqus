import { getters } from '@/store/modules/notebooks/getters';

describe('Notebook getters', () => {
    describe('flatten', () => {
        it('returns root notebooks', () => {
            const state = {
                values: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }]
            };

            const flattened = (getters as any).flatten(state);
            expect(flattened).toHaveLength(4);
            expect(flattened[0]).toHaveProperty('id', '1');
            expect(flattened[1]).toHaveProperty('id', '2');
            expect(flattened[2]).toHaveProperty('id', '3');
            expect(flattened[3]).toHaveProperty('id', '4');
        });

        it('returns nested notebooks', () => {
            const state = {
                values: [
                    {
                        id: '1',
                        children: [{ id: '5' }, { id: '6' }, { id: '7' }, { id: '8', children: [{ id: '9' }] }]
                    },
                    { id: '2' },
                    { id: '3' },
                    { id: '4' }
                ]
            };

            const flattened = (getters as any).flatten(state);
            expect(flattened).toHaveLength(9);
            expect(flattened[0]).toHaveProperty('id', '1');
            expect(flattened[1]).toHaveProperty('id', '2');
            expect(flattened[2]).toHaveProperty('id', '3');
            expect(flattened[3]).toHaveProperty('id', '4');
            expect(flattened[4]).toHaveProperty('id', '5');
            expect(flattened[5]).toHaveProperty('id', '6');
            expect(flattened[6]).toHaveProperty('id', '7');
            expect(flattened[7]).toHaveProperty('id', '8');
            expect(flattened[8]).toHaveProperty('id', '9');
        });

        it('prevents duplicates when a nested notebook has more than 1 parent', () => {
            const state = {
                values: [
                    {
                        id: '1',
                        children: [{ id: '5' }, { id: '6' }, { id: '7' }, { id: '8', children: [{ id: '9' }] }]
                    },
                    { id: '2', children: [{ id: '5' }] },
                    { id: '3', children: [{ id: '5' }] },
                    { id: '4' }
                ]
            };

            const flattened = (getters as any).flatten(state);
            expect(flattened).toHaveLength(9);
        });
    });

    describe('notebooksForNote', () => {
        it('returns notebooks for a note', () => {
            const state = {
                values: [
                    {
                        id: '1',
                        children: [{ id: '5' }, { id: '6' }, { id: '7' }, { id: '8', children: [{ id: '9' }] }]
                    },
                    { id: '2' },
                    { id: '3' },
                    { id: '4' }
                ]
            };

            const note = {
                id: 'a',
                notebooks: ['1', '5', '4']
            };

            const noteNotebooks = (getters as any).notebooksForNote(state, getters)(note);

            expect(noteNotebooks).toHaveLength(3);
            expect(noteNotebooks[0]).toHaveProperty('id', '1');
            expect(noteNotebooks[1]).toHaveProperty('id', '4');
            expect(noteNotebooks[2]).toHaveProperty('id', '5');
        });
    });
});
