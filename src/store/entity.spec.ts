import { generateId } from '@/store/entity';
import { regex } from '@/shared/utils/regex';

describe('generateId()', () => {
    it('generates an id', () => {
        const id = generateId();
        expect(regex.isId(id)).toBeTruthy();
    });
});
