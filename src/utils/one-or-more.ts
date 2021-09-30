export type OneOrMore<T> = T | T[];

export function flatten<T>(oneOrMore: OneOrMore<T>): T[] {
  return Array.isArray(oneOrMore) ? oneOrMore : [oneOrMore];
}
