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
            const active = (getters as any).isTabActive({})('1');
            expect(active).toBeFalsy();
        });

        it('returns true if active tab id matches passed id', () => {
            const active = (getters as any).isTabActive({ activeTab: '1' })('1');
            expect(active).toBeTruthy();
        });

        it('returns false if active tab id does not match passed id', () => {
            const active = (getters as any).isTabActive({ activeTab: '1' })('2');
            expect(active).toBeFalsy();
        });
    });
});
