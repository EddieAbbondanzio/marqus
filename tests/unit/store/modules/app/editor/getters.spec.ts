import { getters } from '@/store/modules/app/modules/editor/getters';

describe('Editor getters', () => {
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
