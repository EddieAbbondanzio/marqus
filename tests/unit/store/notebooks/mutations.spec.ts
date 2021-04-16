import { findNotebookRecursive, mutations } from '@/store/modules/notebooks/mutations';
import { Notebook, NotebookState } from '@/store/modules/notebooks/state';
import { id } from '@/utils/id';

describe('NotebooksStore mutations', () => {
    let state: NotebookState = null!;

    beforeEach(() => {
        state = {
            values: []
        };
    });

    describe('CREATE', () => {
        it('throws error if value is null', () => {
            expect(() => {
                mutations.CREATE(state, {});
            }).toThrow();
        });

        it('sets id', () => {
            mutations.CREATE(state, { id: '1234', value: 'cat' });
            expect(state.values[0].id).toBe('1234');
        });

        it('genenerates id if none passed', () => {
            mutations.CREATE(state, { value: 'cat' });
            expect(state.values[0].id).toBeTruthy();
        });

        it('sets value', () => {
            mutations.CREATE(state, { value: 'cat' });
            expect(state.values[0].value).toBe('cat');
        });

        it('sets parent if passed', () => {
            const parent: Notebook = { id: id(), value: 'cat', expanded: false };
            const child: Notebook = { id: id(), value: 'dog', parent, expanded: false };

            mutations.CREATE(state, parent);
            mutations.CREATE(state, child);

            expect(child.parent).toBe(parent);
            expect(parent.children![0].value).toBe('dog');
        });
    });

    describe('UPDATE', () => {
        it('throws error if value is null', () => {
            const notebook: Notebook = { id: id(), value: 'cat', expanded: false, children: [] };
            state.values.push(notebook);

            expect(() => {
                mutations.UPDATE(state, { id: notebook.id });
            }).toThrow();
        });

        it('updates value', () => {
            const notebook: Notebook = { id: id(), value: 'cat', expanded: false, children: [] };
            state.values.push(notebook);

            mutations.UPDATE(state, { id: notebook.id, value: 'dog' });
            expect(notebook.value).toBe('dog');
        });

        it('finds nested notebooks', () => {
            const parent: Notebook = { id: id(), value: 'cat', expanded: false, children: [] };
            const child: Notebook = { id: id(), value: 'dog', parent, expanded: false };

            state.values.push(parent);
            parent.children!.push(child);
            child.parent = parent;

            mutations.UPDATE(state, { id: child.id, value: 'horse' });
            expect(child.value).toBe('horse');
        });
    });

    describe('DELETE', () => {
        it('deletes root notebook', () => {
            const notebook: Notebook = { id: id(), value: 'cat', expanded: false, children: [] };
            state.values.push(notebook);

            mutations.DELETE(state, notebook.id);
            expect(state.values).toHaveLength(0);
        });

        it('finds a nested notebook', () => {
            const parent: Notebook = { id: id(), value: 'cat', expanded: false, children: [] };
            const child: Notebook = { id: id(), value: 'dog', parent, expanded: false };

            state.values.push(parent);
            parent.children!.push(child);
            child.parent = parent;

            mutations.DELETE(state, child.id);

            expect(parent.children).toHaveLength(0);
        });
    });

    describe('SORT', () => {
        it('sorts alphabetically by value', () => {
            state.values = [
                { id: id(), value: 'horse', expanded: false },
                { id: id(), value: 'correct', expanded: false },
                { id: id(), value: 'battery', expanded: false },
                { id: id(), value: 'staple', expanded: false }
            ];

            mutations.SORT(state);

            expect(state.values[0]).toHaveProperty('value', 'battery');
            expect(state.values[1]).toHaveProperty('value', 'correct');
            expect(state.values[2]).toHaveProperty('value', 'horse');
            expect(state.values[3]).toHaveProperty('value', 'staple');
        });

        it('sorts children', () => {
            state.values = [
                {
                    id: id(),
                    value: 'horse',
                    expanded: false,
                    children: [
                        { id: id(), value: 'correct', expanded: false },
                        { id: id(), value: 'battery', expanded: false },
                        { id: id(), value: 'staple', expanded: false }
                    ]
                }
            ];

            mutations.SORT(state);

            const notebook = state.values[0];

            expect(notebook.children![0]).toHaveProperty('value', 'battery');
            expect(notebook.children![1]).toHaveProperty('value', 'correct');
            expect(notebook.children![2]).toHaveProperty('value', 'staple');
        });
    });
});

describe('findNotebookRecursive()', () => {
    const notebooks = [
        {
            id: id(),
            value: 'horse',
            expanded: false,
            children: [
                { id: id(), value: 'correct', expanded: false },
                { id: id(), value: 'battery', expanded: false },
                { id: id(), value: 'staple', expanded: false }
            ]
        }
    ];

    it('returns nothing if no notebooks passed', () => {
        const match = findNotebookRecursive(null!, '1');
        expect(match).toBeUndefined();
    });

    it('can find a root match', () => {
        const match = findNotebookRecursive(notebooks, notebooks[0].id);
        expect(match).toHaveProperty('id', notebooks[0].id);
    });

    it('can find a nested notebook', () => {
        const match = findNotebookRecursive(notebooks, notebooks[0].children[2].id);
        expect(match).toHaveProperty('id', notebooks[0].children[2].id);
    });

    it('returns nothing if no match found after searching', () => {
        const match = findNotebookRecursive(notebooks, '1');
        expect(match).toBeUndefined();
    });
});
