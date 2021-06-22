import { Entity, generateId } from '@/core/store/entity';
import { regex } from '@/utils/regex';

describe('generateId()', () => {
    it('generates an id', () => {
        const id = generateId();
        expect(regex.isId(id)).toBeTruthy();
    });
});
