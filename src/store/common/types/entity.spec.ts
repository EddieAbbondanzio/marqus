import { generateId, isId } from '@/store';

describe('generateId()', () => {
    it('generates an id', () => {
        const id = generateId();
        expect(isId(id)).toBeTruthy();
    });
});

describe('isId()', () => {
    it('returns false if not id', () => {
        expect(isId('cat')).toBeFalsy();
    });

    it('returns true if id', () => {
        expect(isId('7d843d87-c3fa-47db-8858-42513ecbc7ba')).toBeTruthy();
    });
});
