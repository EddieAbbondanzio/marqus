import { getters } from '@/store/modules/app/modules/global-navigation/getters';
import { Notebook } from '@/store/modules/notebooks/state';

describe('GlobalNavigation getters', () => {
    let state: any;

    beforeEach(() => {
        state = {
            tags: {
                input: {}
            },
            notebooks: {
                input: {}
            }
        };
    });

    describe('indentation', () => {
        it('returns 24px as default', () => {
            const i = (getters as any).indentation()(1);
            expect(i).toBe('24px');
        });

        it('multiples by value passed', () => {
            const i = (getters as any).indentation()(3);
            expect(i).toBe('72px');
        });
    });

    describe('isTagBeingCreated', () => {
        it('returns true if mode create', () => {
            state.tags.input.mode = 'create';

            const res = (getters as any).isTagBeingCreated(state);
            expect(res).toBeTruthy();
        });

        it('returns false if mode is null', () => {
            const res = (getters as any).isTagBeingCreated(state);
            expect(res).toBeFalsy();
        });

        it('returns false if mode is update', () => {
            state.tags.input.mode = 'update';

            const res = (getters as any).isTagBeingCreated(state);
            expect(res).toBeFalsy();
        });
    });

    describe('isTagBeingUpdated', () => {
        it('returns true if mode is update, and id matches', () => {
            state.tags.input.mode = 'update';
            state.tags.input.id = '1';

            const res = (getters as any).isTagBeingUpdated(state)('1');
            expect(res).toBeTruthy();
        });

        it('returns false if mode is update but id is different', () => {
            state.tags.input.mode = 'update';
            state.tags.input.id = '2';

            const res = (getters as any).isTagBeingUpdated(state)('1');
            expect(res).toBeFalsy();
        });

        it('returns false if mode is null', () => {
            const res = (getters as any).isTagBeingUpdated(state)('1');
            expect(res).toBeFalsy();
        });

        it('returns false if mode is create', () => {
            state.tags.input.mode = 'create';
            const res = (getters as any).isTagBeingUpdated(state)('1');
            expect(res).toBeFalsy();
        });
    });

    describe('isNotebookBeingCreated', () => {
        it('returns true if mode create', () => {
            state.notebooks.input.mode = 'create';

            const res = (getters as any).isNotebookBeingCreated(state)();
            expect(res).toBeTruthy();
        });

        it('returns false if mode is null', () => {
            const res = (getters as any).isNotebookBeingCreated(state)();
            expect(res).toBeFalsy();
        });

        it('returns false if mode is update', () => {
            state.notebooks.input.mode = 'update';

            const res = (getters as any).isNotebookBeingCreated(state)();
            expect(res).toBeFalsy();
        });

        it('returns true if parent id was passed, and matches', () => {
            state.notebooks.input.mode = 'create';
            state.notebooks.input.parent = { id: '1' };

            const res = (getters as any).isNotebookBeingCreated(state)('1');
            expect(res).toBeTruthy();
        });

        it("returns false if parent id was passed, but doens't match.", () => {
            state.notebooks.input.mode = 'create';
            state.notebooks.input.parent = { id: '1' };

            const res = (getters as any).isNotebookBeingCreated(state)('2');
            expect(res).toBeFalsy();
        });

        it('returns false if no parent id was passed, but input has parent', () => {
            state.notebooks.input.mode = 'create';
            state.notebooks.input.parent = { id: '1' };

            const res = (getters as any).isNotebookBeingCreated(state)();
            expect(res).toBeFalsy();
        });
    });

    describe('isNotebookBeingUpdated', () => {
        it('returns true if mode is update, and id matches', () => {
            state.notebooks.input.mode = 'update';
            state.notebooks.input.id = '1';
            const res = (getters as any).isNotebookBeingUpdated(state)('1');
            expect(res).toBeTruthy();
        });

        it('returns false if mode is update but id is different', () => {
            state.notebooks.input.mode = 'update';
            state.notebooks.input.id = '2';
            const res = (getters as any).isNotebookBeingUpdated(state)('1');
            expect(res).toBeFalsy();
        });

        it('returns false if mode is null', () => {
            const res = (getters as any).isNotebookBeingUpdated(state)('1');
            expect(res).toBeFalsy();
        });

        it('returns false if mode is create', () => {
            state.notebooks.input.mode = 'create';
            const res = (getters as any).isNotebookBeingUpdated(state)('1');
            expect(res).toBeFalsy();
        });
    });

    describe('canNotebookBeCollapsed', () => {
        it('returns false when notebook has no children', () => {
            const n: Notebook = {
                id: '1',
                value: 'cat',
                expanded: false
            };

            const res = (getters as any).canNotebookBeCollapsed(state)(n);
            expect(res).toBeFalsy();
        });

        it('returns true if notebook has children', () => {
            const n: Notebook = {
                id: '1',
                value: 'cat',
                expanded: false,
                children: [{ id: '2', value: 'dog', expanded: false }]
            };

            const res = (getters as any).canNotebookBeCollapsed(state)(n);
            expect(res).toBeTruthy();
        });

        it('returns false if notebook has no children', () => {
            state.notebooks.input.mode = 'create';

            const n: Notebook = {
                id: '1',
                value: 'cat',
                expanded: false
            };

            const res = (getters as any).canNotebookBeCollapsed(state)(n);
            expect(res).toBeFalsy();
        });
    });

    describe('notebookDepth()', () => {
        it('returns 1 for root notebook', () => {
            const n: Notebook = {
                id: '1',
                value: 'cat',
                expanded: false
            };

            const depth = (getters as any).notebookDepth(state)(n);
            expect(depth).toBe(1);
        });

        it('returns 2 for nested notebooks', () => {
            const n: Notebook = {
                id: '1',
                value: 'cat',
                expanded: false,
                children: [
                    {
                        id: '2',
                        value: 'dog',
                        expanded: false
                    }
                ]
            };

            n.children![0].parent = n;

            const depth = (getters as any).notebookDepth(state)(n.children![0]);
            expect(depth).toBe(2);
        });

        it('can handle deep nested notebooks', () => {
            const n: Notebook = {
                id: '1',
                value: 'cat',
                expanded: false,
                children: [
                    {
                        id: '2',
                        value: 'dog',
                        expanded: false,
                        children: [{ id: '3', value: 'horse', expanded: false }]
                    }
                ]
            };

            n.children![0].parent = n;
            n.children![0].children![0].parent = n.children![0];

            const depth = (getters as any).notebookDepth(state)(n.children![0].children![0]);
            expect(depth).toBe(3);
        });
    });
});
