import { regex } from '@/shared/utils/regex';

describe('regex', () => {
    describe('isId()', () => {
        it('returns false if not id', () => {
            expect(regex.isId('cat')).toBeFalsy();
        });

        it('returns true if id', () => {
            expect(regex.isId('7d843d87-c3fa-47db-8858-42513ecbc7ba')).toBeTruthy();
        });
    });
});
