import { isAsync } from '@/store/plugins/undo/is-async';

describe('isAsync()', () => {
    it('returns true for an async function', () => {
        const fn = async () => 1;

        expect(isAsync(fn)).toBeTruthy();
    });

    it('returns false for a sync function', () => {
        const fn = () => 1;

        expect(isAsync(fn)).toBeFalsy();
    });
});
