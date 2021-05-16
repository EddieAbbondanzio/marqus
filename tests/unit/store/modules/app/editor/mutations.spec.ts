import { mutations } from '@/store/modules/app/modules/editor/mutations';
import { Editor } from '@/store/modules/app/modules/editor/state';

describe('Editor mutations', () => {
    describe('ACTIVE()', () => {
        it('sets activeTab', () => {
            const state: any = {};

            mutations.ACTIVE(state, '1');
            expect(state.activeTab).toBe('1');
        });
    });

    describe('EXIT_PREVIEW()', () => {
        it('sets state as normal', () => {
            const state: Editor = {
                tabs: [{ id: 'a', noteId: '1', state: 'preview', content: '' }]
            };

            mutations.EXIT_PREVIEW(state, 'a');
            expect(state.tabs[0].state).toBe('normal');
        });
    });

    describe('OPEN_TAB()', () => {
        it('stops if existing tab is already open', () => {
            const state: Editor = {
                tabs: [{ id: 'a', noteId: '1', state: 'normal', content: '' }]
            };

            mutations.OPEN_TAB(state, { noteId: '1', content: '' });

            expect(state.tabs).toHaveLength(1);
        });

        it('changes existing preview tab to normal', () => {
            const state: Editor = {
                tabs: [{ id: 'a', noteId: '1', state: 'preview', content: '' }]
            };

            mutations.OPEN_TAB(state, { noteId: '1', content: '' });

            expect(state.tabs).toHaveLength(1);
            expect(state.tabs[0].state).toBe('normal');
        });

        it('sets existing tab as active', () => {
            const state: Editor = {
                tabs: [{ id: 'a', noteId: '1', state: 'normal', content: '' }]
            };

            mutations.OPEN_TAB(state, { noteId: '1', content: '' });

            expect(state.tabs).toHaveLength(1);
            expect(state.activeTab).toBe('a');
        });

        it('closes any existing preview tabs when opening a new preview tab', () => {
            const state: Editor = {
                tabs: [{ id: 'a', noteId: '1', state: 'preview', content: '' }]
            };

            mutations.OPEN_TAB(state, { noteId: '2', content: '' });

            expect(state.tabs).toHaveLength(1);
            expect(state.tabs[0].noteId).toBe('2');
        });

        it('sets newly opened tab as active', () => {
            const state: Editor = {
                tabs: []
            };

            mutations.OPEN_TAB(state, { noteId: '2', content: '' });

            expect(state.activeTab).toBe(state.tabs[0].id);
        });
    });

    describe('CLOSE_TAB()', () => {
        it('removes tab from array', () => {
            const state: any = {
                tabs: [{ id: '1' }, { id: '2' }]
            };

            mutations.CLOSE_TAB(state, '1');

            expect(state.tabs).toHaveLength(1);
            expect(state.tabs[0].id).toBe('2');
        });
    });

    describe('CLOSE_ALL_TABS()', () => {
        it('empties out tab array', () => {
            const state: any = {
                tabs: [{}, {}]
            };

            mutations.CLOSE_ALL_TABS(state, null);

            expect(state.tabs).toHaveLength(0);
        });
    });
});
