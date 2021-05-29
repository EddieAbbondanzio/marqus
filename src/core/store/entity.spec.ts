import { Entity, generateId, getEntity } from '@/core/store/entity';
import { regex } from '@/utils/regex';

describe('getEntity()', () => {
    it('returns entity passed', () => {
        const e: Entity | string = { id: generateId() };
        const returned = getEntity(e, null!);

        expect(returned).toBe(e);
    });

    it('searches for entity when id is passed', () => {
        const id = generateId();
        const entity = { id };
        const findPredicate = (id: string) => entity;

        expect(getEntity(id, findPredicate)).toBe(entity);
    });

    it('throws if no entity found', () => {
        const id = generateId();
        const findPredicate = (id: string) => null!;

        expect(() => getEntity(id, findPredicate)).toThrow();
    });

    it('uses custom name when throwing exception', () => {
        const id = generateId();
        const findPredicate = (id: string) => null!;

        expect(() => getEntity(id, findPredicate, 'Name')).toThrow(`Name with id ${id} not found.`);
    });
});

describe('generateId()', () => {
    it('generates an id', () => {
        const id = generateId();
        expect(regex.isId(id)).toBeTruthy();
    });
});
