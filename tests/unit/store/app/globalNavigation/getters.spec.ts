import { getters } from '@/store/modules/app/modules/global-navigation/getters';

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

            const res = (getters as any).isNotebookBeingCreated(state);
            expect(res).toBeTruthy();
        });

        it('returns false if mode is null', () => {
            const res = (getters as any).isNotebookBeingCreated(state);
            expect(res).toBeFalsy();
        });

        it('returns false if mode is update', () => {
            state.notebooks.input.mode = 'update';

            const res = (getters as any).isNotebookBeingCreated(state);
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
});
