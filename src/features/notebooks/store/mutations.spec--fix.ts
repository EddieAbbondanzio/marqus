import { mutations } from '@/features/notebooks/store/mutations';
import { Notebook } from '@/features/notebooks/common/notebook';
import { NotebookState } from '@/features/notebooks/store/state';
import { generateId } from '@/store';

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

        it('sets value', () => {
            mutations.CREATE(state, { value: 'cat' });
            expect(state.values[0].value).toBe('cat');
        });

        it('sets parent if passed', () => {
            const parent: Notebook = { id: generateId(), value: 'cat', expanded: false };
            const child: Notebook = { id: generateId(), value: 'dog', parent, expanded: false };

            mutations.CREATE(state, parent);
            mutations.CREATE(state, child);

            expect(child.parent).toBe(parent);
            expect(parent.children![0].value).toBe('dog');

            // Ensure a nested record isn't added to root.
            expect(state.values.find((c) => c.id === child.id)).toBeUndefined();
        });
    });

    describe('SET_NAME', () => {
        it('throws error if value is null', () => {
            const notebook: Notebook = { id: generateId(), value: 'cat', expanded: false, children: [] };
            state.values.push(notebook);

            expect(() => {
                mutations.SET_NAME(state, { id: notebook.id });
            }).toThrow();
        });

        it('updates value', () => {
            const notebook: Notebook = { id: generateId(), value: 'cat', expanded: false, children: [] };
            state.values.push(notebook);

            mutations.SET_NAME(state, { id: notebook.id, value: 'dog' });
            expect(notebook.value).toBe('dog');
        });

        it('finds nested notebooks', () => {
            const parent: Notebook = { id: generateId(), value: 'cat', expanded: false, children: [] };
            const child: Notebook = { id: generateId(), value: 'dog', parent, expanded: false };

            state.values.push(parent);
            parent.children!.push(child);
            child.parent = parent;

            mutations.SET_NAME(state, { id: child.id, value: 'horse' });
            expect(child.value).toBe('horse');
        });
    });

    describe('DELETE', () => {
        it('deletes root notebook', () => {
            const notebook: Notebook = { id: generateId(), value: 'cat', expanded: false, children: [] };
            state.values.push(notebook);

            mutations.DELETE(state, { id: notebook.id });
            expect(state.values).toHaveLength(0);
        });

        it('finds a nested notebook', () => {
            const parent: Notebook = { id: generateId(), value: 'cat', expanded: false, children: [] };
            const child: Notebook = { id: generateId(), value: 'dog', parent, expanded: false };

            state.values.push(parent);
            parent.children!.push(child);
            child.parent = parent;

            mutations.DELETE(state, { id: child.id });

            expect(parent.children).toBeUndefined();
        });
    });

    describe('SORT', () => {
        it('sorts alphabetically by value', () => {
            state.values = [
                { id: generateId(), value: 'horse', expanded: false },
                { id: generateId(), value: 'correct', expanded: false },
                { id: generateId(), value: 'battery', expanded: false },
                { id: generateId(), value: 'staple', expanded: false }
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
                    id: generateId(),
                    value: 'horse',
                    expanded: false,
                    children: [
                        { id: generateId(), value: 'correct', expanded: false },
                        { id: generateId(), value: 'battery', expanded: false },
                        { id: generateId(), value: 'staple', expanded: false }
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

    describe('SET_EXPANDED', () => {
        it('assign notebook.expanded to the parameter', () => {
            const notebook: Notebook = {
                id: '1',
                value: 'cat',
                expanded: false
            };

            mutations.SET_EXPANDED(state, { notebook, expanded: true });
            expect(notebook.expanded).toBeTruthy();
        });

        it("doesn't bubble up by default", () => {
            const notebook: Notebook = {
                id: '1',
                value: 'cat',
                expanded: false,
                children: [{ id: '2', value: 'dog', expanded: false }]
            };

            notebook.children![0].parent = notebook;

            mutations.SET_EXPANDED(state, { notebook: notebook.children![0], expanded: true });
            expect(notebook.expanded).toBeFalsy();
        });

        it('will bubbleUp when requested', () => {
            const notebook: Notebook = {
                id: '1',
                value: 'cat',
                expanded: false,
                children: [{ id: '2', value: 'dog', expanded: false }]
            };

            notebook.children![0].parent = notebook;

            mutations.SET_EXPANDED(state, { notebook: notebook.children![0], expanded: true, bubbleUp: true });
            expect(notebook.expanded).toBeTruthy();
        });
    });

    describe('SET_ALL_EXPANDED', () => {
        it('sets root expanded', () => {
            const parent: Notebook = { id: generateId(), value: 'cat', expanded: false, children: [] };
            const child: Notebook = { id: generateId(), value: 'dog', parent, expanded: false };

            state.values.push(parent);
            parent.children!.push(child);
            child.parent = parent;

            mutations.SET_ALL_EXPANDED(state, true);

            expect(parent.expanded).toBeTruthy();
        });

        it('sets nested expanded', () => {
            const parent: Notebook = { id: generateId(), value: 'cat', expanded: false, children: [] };
            const child: Notebook = { id: generateId(), value: 'dog', parent, expanded: false };

            state.values.push(parent);
            parent.children!.push(child);
            child.parent = parent;

            mutations.SET_ALL_EXPANDED(state, true);

            expect(child.expanded).toBeTruthy();
        });
    });
});
