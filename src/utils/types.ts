export type OneOrMore<T> = T | T[];

export function flatten<T>(oneOrMore: OneOrMore<T>): T[] {
  return Array.isArray(oneOrMore) ? oneOrMore : [oneOrMore];
}

export type PartialRecord<K extends string, V> = { [Key in K]?: V }

export type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};
