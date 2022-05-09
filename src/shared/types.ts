// Narrow a union type
export type Narrow<T, N> = T extends { type: N } ? T : never;
