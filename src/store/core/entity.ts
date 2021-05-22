import { v4 as uuidv4 } from 'uuid';

export interface Entity {
    id: string;
}

/**
 * Distinguishes a union type into the desired entity.
 * @param idOrEntity Id, or entity to get.
 * @param findPredicate Finder called when an id was passed.
 * @param name What to call the entity in case an error needs to be thrown.
 * @returns The entity passed, or one that matches the id passed.
 */
export function getEntity<T>(
    idOrEntity: string | T,
    findPredicate: (id: string) => T | undefined | null,
    name = 'Entity'
): T {
    const entity: T | null | undefined = typeof idOrEntity === 'string' ? findPredicate(idOrEntity) : idOrEntity;

    if (entity == null) {
        throw Error(`${name} with id ${idOrEntity} not found.`);
    }

    return entity;
}

/**
 * Generate a new entity id.
 */
export const generateId = uuidv4;
