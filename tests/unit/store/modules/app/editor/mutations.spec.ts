import { mutations } from '@/store/modules/app/modules/editor/mutations';
import { Editor } from '@/store/modules/app/modules/editor/state';

describe('Editor mutations', () => {
    describe('ACTIVE()', () => {
        it('sets activeTab', () => {
            const state: Editor = {
                tabs: {} as any
            };

            mutations.ACTIVE(state, '1');
            expect(state.tabs.active).toBe('1');
        });
    });

    describe('EXIT_PREVIEW()', () => {
        it('sets state as normal', () => {
            const state: Editor = {
                tabs: {
                    values: [{ id: 'a', noteId: '1', state: 'preview', content: '' }]
                }
            };

            mutations.EXIT_PREVIEW(state, 'a');
            expect(state.tabs.values[0].state).toBe('normal');
        });
    });

    describe('OPEN_TAB()', () => {
        it('stops if existing tab is already open', () => {
            const state: Editor = {
                tabs: { values: [{ id: 'a', noteId: '1', state: 'normal', content: '' }] }
            };

            mutations.OPEN_TAB(state, { noteId: '1', content: '' });

            expect(state.tabs.values).toHaveLength(1);
        });

        it('changes existing preview tab to normal', () => {
            const state: Editor = {
                tabs: { values: [{ id: 'a', noteId: '1', state: 'preview', content: '' }] }
            };

            mutations.OPEN_TAB(state, { noteId: '1', content: '' });

            expect(state.tabs.values).toHaveLength(1);
            expect(state.tabs.values[0].state).toBe('normal');
        });

        it('sets existing tab as active', () => {
            const state: Editor = {
                tabs: {
                    values: [{ id: 'a', noteId: '1', state: 'normal', content: '' }]
                }
            };

            mutations.OPEN_TAB(state, { noteId: '1', content: '' });

            expect(state.tabs.values).toHaveLength(1);
            expect(state.tabs.active).toBe('a');
        });

        it('closes any existing preview tabs when opening a new preview tab', () => {
            const state: Editor = {
                tabs: { values: [{ id: 'a', noteId: '1', state: 'preview', content: '' }] }
            };

            mutations.OPEN_TAB(state, { noteId: '2', content: '' });

            expect(state.tabs.values).toHaveLength(1);
            expect(state.tabs.values[0].noteId).toBe('2');
        });

        it('sets newly opened tab as active', () => {
            const state: Editor = {
                tabs: {
                    values: []
                }
            };

            mutations.OPEN_TAB(state, { noteId: '2', content: '' });

            expect(state.tabs.active).toBe(state.tabs.values[0].id);
        });
    });

    describe('CLOSE_TAB()', () => {
        it('removes tab from array', () => {
            const state: Editor = {
                tabs: { values: [{ id: '1' } as any, { id: '2' }] }
            };

            mutations.CLOSE_TAB(state, '1');

            expect(state.tabs.values).toHaveLength(1);
            expect(state.tabs.values[0].id).toBe('2');
        });
    });

    describe('CLOSE_ALL_TABS()', () => {
        it('empties out tab array', () => {
            const state: Editor = {
                tabs: { values: [{} as any, {} as any] }
            };

            mutations.CLOSE_ALL_TABS(state, null);

            expect(state.tabs.values).toHaveLength(0);
        });
    });

    describe('TAB_DRAGGING()', () => {
        it('sets dragging as passed', () => {
            const state: Editor = {
                tabs: { values: [] }
            };

            mutations.TAB_DRAGGING(state, { id: '1' });
            expect(state.tabs.dragging!.id).toBe('1');
        });
    });

    describe('TAB_DRAGGING_NEW_INDEX()', () => {
        it('throws if not dragging', () => {
            const state: Editor = {
                tabs: { values: [] }
            };

            expect(() => {
                mutations.TAB_DRAGGING_NEW_INDEX(state);
            }).toThrow();
        });
    });

    describe('it moves tab to new index', () => {
        const state: Editor = {
            tabs: { values: [{ id: '1' }, { id: '2' }, { id: '3' }] as any[] }
        };

        mutations.TAB_DRAGGING(state, { id: '1' });
        mutations.TAB_DRAGGING_NEW_INDEX(state, 2);

        expect(state.tabs.values).toHaveLength(3);
        expect(state.tabs.values[0].id).toBe('2');
        expect(state.tabs.values[1].id).toBe('3');
        expect(state.tabs.values[2].id).toBe('1');
    });
});
