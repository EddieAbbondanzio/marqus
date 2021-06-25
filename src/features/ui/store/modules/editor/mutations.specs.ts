// import { mutations } from '@/features/ui/store/modules/editor/mutations';

// describe('Editor mutations', () => {
//     describe('ACTIVE()', () => {
//         it('sets activeTab', () => {
//             const state: any = {
//                 tabs: {} as any
//             };

//             mutations.ACTIVE(state, '1');
//             expect(state.tabs.active).toBe('1');
//         });
//     });

//     describe('TAB_CONTENT', () => {
//         it('sets content and marks as dirty', () => {
//             const state: any = {
//                 tabs: {
//                     values: [{ id: '1', content: 'foo' }]
//                 }
//             };

//             mutations.TAB_CONTENT(state, { tab: '1', content: 'bar' });
//             expect(state.tabs.values[0].content).toBe('bar');
//             expect(state.tabs.values[0].state).toBe('dirty');
//         });
//     });

//     describe('TAB_STATE', () => {
//         it('sets state', () => {
//             const state: any = {
//                 tabs: {
//                     values: [{ id: '1', content: 'foo' }]
//                 }
//             };

//             mutations.TAB_STATE(state, { tab: '1', state: 'preview' });
//             expect(state.tabs.values[0].state).toBe('preview');
//         });
//     });

//     describe('EXIT_PREVIEW()', () => {
//         it('sets state as normal', () => {
//             const state: any = {
//                 tabs: {
//                     values: [{ id: 'a', noteId: '1', state: 'preview', content: '' }]
//                 }
//             };

//             mutations.EXIT_PREVIEW(state, 'a');
//             expect(state.tabs.values[0].state).toBe('normal');
//         });
//     });

//     describe('OPEN_TAB()', () => {
//         it('stops if existing tab is already open', () => {
//             const state: any = {
//                 tabs: { values: [{ id: 'a', noteId: '1', state: 'normal', content: '' }] }
//             };

//             mutations.OPEN_TAB(state, { noteId: '1', content: '' });

//             expect(state.tabs.values).toHaveLength(1);
//         });

//         it('changes existing preview tab to normal', () => {
//             const state: any = {
//                 tabs: { values: [{ id: 'a', noteId: '1', state: 'preview', content: '' }], active: 'a' }
//             };

//             mutations.OPEN_TAB(state, { noteId: '1', content: '' });

//             expect(state.tabs.values).toHaveLength(1);
//             expect(state.tabs.values[0].state).toBe('normal');
//         });

//         it('sets existing tab as active', () => {
//             const state: any = {
//                 tabs: {
//                     values: [{ id: 'a', noteId: '1', state: 'normal', content: '' }]
//                 }
//             };

//             mutations.OPEN_TAB(state, { noteId: '1', content: '' });

//             expect(state.tabs.values).toHaveLength(1);
//             expect(state.tabs.active).toBe('a');
//         });

//         it('replaces existing preview tab when opening a new preview tab', () => {
//             const state: any = {
//                 tabs: {
//                     values: [
//                         { id: 'a', noteId: '1', state: 'preview', content: '' },
//                         { id: 'b', noteId: '2', state: 'readonly', content: '' },
//                         { id: 'c', noteId: '3', state: 'readonly', content: '' }
//                     ]
//                 }
//             };

//             mutations.OPEN_TAB(state, { noteId: '4', content: '' });

//             expect(state.tabs.values).toHaveLength(3);
//             expect(state.tabs.values[0].noteId).toBe('4');
//         });

//         it('sets newly opened tab as active', () => {
//             const state: any = {
//                 tabs: {
//                     values: []
//                 }
//             };

//             mutations.OPEN_TAB(state, { noteId: '2', content: '' });

//             expect(state.tabs.active).toBe(state.tabs.values[0].id);
//         });

//         it('will add preview tab to end of tab array if no existing preview tab.', () => {
//             const state: any = {
//                 tabs: {
//                     values: [{ id: 'b', noteId: '2', state: 'readonly', content: '' }]
//                 }
//             };

//             mutations.OPEN_TAB(state, { noteId: '3', preview: true });

//             expect(state.tabs.values).toHaveLength(2);
//             expect(state.tabs.values[0]).toHaveProperty('noteId', '2');
//             expect(state.tabs.values[1]).toHaveProperty('noteId', '3');
//         });
//     });

//     describe('CLOSE_TAB()', () => {
//         it('removes tab from array', () => {
//             const state: any = {
//                 tabs: { values: [{ id: '1' } as any, { id: '2' }] }
//             };

//             mutations.CLOSE_TAB(state, '1');

//             expect(state.tabs.values).toHaveLength(1);
//             expect(state.tabs.values[0].id).toBe('2');
//         });
//     });

//     describe('CLOSE_ALL_TABS()', () => {
//         it('empties out tab array', () => {
//             const state: any = {
//                 tabs: { values: [{} as any, {} as any] }
//             };

//             mutations.CLOSE_ALL_TABS(state, null);

//             expect(state.tabs.values).toHaveLength(0);
//         });
//     });

//     describe('TAB_DRAGGING()', () => {
//         it('sets dragging as passed', () => {
//             const state: any = {
//                 tabs: { values: [] }
//             };

//             mutations.TAB_DRAGGING(state, { id: '1' });
//             expect(state.tabs.dragging!.id).toBe('1');
//         });
//     });

//     describe('TAB_DRAGGING_NEW_INDEX()', () => {
//         it('throws if not dragging', () => {
//             const state: any = {
//                 tabs: { values: [] }
//             };

//             expect(() => {
//                 mutations.TAB_DRAGGING_NEW_INDEX(state);
//             }).toThrow();
//         });

//         it('it moves tab to new index', () => {
//             const state: any = {
//                 tabs: { values: [{ id: '1' }, { id: '2' }, { id: '3' }] as any[] }
//             };

//             mutations.TAB_DRAGGING(state, { id: '1' });
//             mutations.TAB_DRAGGING_NEW_INDEX(state, 2);

//             expect(state.tabs.values).toHaveLength(3);
//             expect(state.tabs.values[0].id).toBe('2');
//             expect(state.tabs.values[1].id).toBe('3');
//             expect(state.tabs.values[2].id).toBe('1');
//         });
//     });

//     // describe('SWITCH_TAB', () => {
//     //     it('deletes notebook drop down active state, and tag drop down active state', () => {
//     //         const state: any = {
//     //             tabs: {
//     //                 active: '1',
//     //                 values: [
//     //                     { id: '1', notebookDropdownActive: true, tagDropdownActive: true },
//     //                     { id: '2' },
//     //                     { id: '3' }
//     //                 ] as any[]
//     //             }
//     //         };

//     //         mutations.SWITCH_TAB(state, '1');
//     //         expect(state.tabs.values[0].notebookDropdownActive).toBeUndefined();
//     //         expect(state.tabs.values[0].tagDropdownActive).toBeUndefined();
//     //     });
//     // });

//     describe('MODE', () => {
//         it('throws if mode passed is null', () => {
//             const state: any = {};

//             expect(() => mutations.MODE(state, null!)).toThrow();
//         });

//         it('sets mode', () => {
//             const state: any = {};
//             mutations.MODE(state, 'view');

//             expect(state.mode).toBe('view');
//         });
//     });
// });
