export type PartialRecord<K extends string, V> = { [Key in K]?: V }

export type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};
