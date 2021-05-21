import { getters } from '@/store/modules/app/modules/editor/getters';

describe('Editor getters', () => {
    describe('activeNote', () => {
        it('returns null if active tab is null', () => {
            const state: any = {
                tabs: {}
            };

            const activeNote = getters['activeNote'](state, null, null!, null);
            expect(activeNote).toBeNull();
        });

        it('returns active note by matching noteId of active tab', () => {
            const state: any = {
                tabs: {
                    active: 'tab-id',
                    values: [{ id: 'tab-id', noteId: '1' }]
                }
            };

            const rootState: any = {
                notes: {
                    values: [{ id: '1' }]
                }
            };

            const activeNote = getters['activeNote'](state, null, rootState, null);
            expect(activeNote).toHaveProperty('id', '1');
        });
    });

    describe('activeTab', () => {
        it('returns null if no active tab', () => {
            const state: any = {
                tabs: {
                    active: null
                }
            };

            const activeNote = getters['activeTab'](state, null, null!, null);
            expect(activeNote).toBeNull();
        });

        it('returns active tab', () => {
            const state: any = {
                tabs: {
                    active: '2',
                    values: [{ id: '1' }, { id: '2' }]
                }
            };

            const activeNote = getters['activeTab'](state, null, null!, null);
            expect(activeNote).toHaveProperty('id', '2');
        });
    });

    describe('noteName()', () => {
        it('returns note name via id', () => {
            const rootState = {
                notes: {
                    values: [{ id: '1', name: 'foo' }]
                }
            };

            const noteName = (getters as any).noteName(null, null, rootState)('1');
            expect(noteName).toBe('foo');
        });

        it('returns empty string if null', () => {
            const rootState = {
                notes: {
                    values: [{ id: '1', name: 'foo' }]
                }
            };

            const noteName = (getters as any).noteName(null, null, rootState)('2');
            expect(noteName).toBe('');
        });
    });

    describe('isTabActive()', () => {
        it('returns false if activeTab is null', () => {
            const state = {
                tabs: {}
            };

            const active = (getters as any).isTabActive(state)('1');
            expect(active).toBeFalsy();
        });

        it('returns true if active tab id matches passed id', () => {
            const state = {
                tabs: {
                    active: '1'
                }
            };

            const active = (getters as any).isTabActive(state)('1');
            expect(active).toBeTruthy();
        });

        it('returns false if active tab id does not match passed id', () => {
            const state = {
                tabs: {
                    active: '1'
                }
            };

            const active = (getters as any).isTabActive(state)('2');
            expect(active).toBeFalsy();
        });
    });

    describe('isDragging()', () => {
        it('returns false if tabs.dragging is null', () => {
            const state = {
                tabs: {
                    active: '1'
                }
            };

            expect((getters as any).isDragging(state)).toBeFalsy();
        });

        it('returns true if tabs.dragging is not null', () => {
            const state = {
                tabs: {
                    active: '1',
                    dragging: {}
                }
            };

            expect((getters as any).isDragging(state)).toBeTruthy();
        });
    });
});
