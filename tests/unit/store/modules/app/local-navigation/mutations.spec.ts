import { mutations } from '@/store/modules/app/modules/local-navigation/mutations';
import { LocalNavigation } from '@/store/modules/app/modules/local-navigation/state';

describe('LocalNavigation Mutations', () => {
    let state: LocalNavigation;

    beforeEach(() => {
        state = {
            width: '100px',
            notes: { input: {} }
        };
    });

    describe('WIDTH', () => {
        it('sets width', () => {
            mutations.WIDTH(state, '300px');
            expect(state.width).toBe('300px');
        });
    });

    describe('ACTIVE', () => {
        it('sets active', () => {
            mutations.ACTIVE(state, '1');
            expect(state.active).toBe('1');
        });
    });
});
