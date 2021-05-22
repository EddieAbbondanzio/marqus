export interface Entity {
    id: string;
}

export function getEntity<T>(idOrEntity: string | T, findPredicate: (id: string) => T, name: string = 'Entity'): T {
    let entity: T = typeof idOrEntity === 'string' ? findPredicate(idOrEntity) : idOrEntity;

    if (entity == null) {
        throw Error(`${name} with id ${idOrEntity} not found.`);
    }

    return entity;
}
