export function caseInsensitiveCompare(): (a: string, b: string) => number;
export function caseInsensitiveCompare<T>(
  mapper: (v: T) => string
): (a: T, b: T) => number;
export function caseInsensitiveCompare<T>(mapper?: (v: T) => string) {
  if (mapper != null) {
    return (a: T, b: T) =>
      mapper(a)
        .toLowerCase()
        .localeCompare(mapper(b).toLowerCase());
  } else {
    return (a: string, b: string) =>
      a.toLowerCase().localeCompare(b.toLowerCase());
  }
}

export function isBlank(str?: string): boolean {
  return str == null || /^\s*$/.test(str);
}
