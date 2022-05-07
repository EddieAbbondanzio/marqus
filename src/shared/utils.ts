import { string } from "yup";

export function caseInsensitiveCompare(): (a: string, b: string) => number;
export function caseInsensitiveCompare<T>(
  mapper: (v: T) => string
): (a: T, b: T) => number;
export function caseInsensitiveCompare<T>(
  mapper?: (v: T) => string
): (a: any, b: any) => number {
  if (mapper != null) {
    return (a: T, b: T) =>
      mapper(a).toLowerCase().localeCompare(mapper(b).toLowerCase());
  } else {
    return (a: string, b: string) =>
      a.toLowerCase().localeCompare(b.toLowerCase());
  }
}

export function isBlank(str?: string): boolean {
  return str == null || /^\s*$/.test(str);
}

export function findNext<T>(
  values: T[],
  startIndex: number,
  predicate: (val: T, index: number) => boolean
): T | undefined {
  for (let i = startIndex + 1; i < values.length; i++) {
    const val = values[i];
    if (predicate(val, i)) {
      return val;
    }
  }
}

export function findPrevious<T>(
  values: T[],
  startIndex: number,
  predicate: (val: T, index: number) => boolean
): T | undefined {
  for (let i = startIndex - 1; i >= 0; i--) {
    const val = values[i];
    if (predicate(val, i)) {
      return val;
    }
  }
}
export function sleep(milliseconds: number): Promise<void> {
  return new Promise((res) => {
    setTimeout(res, milliseconds);
  });
}

export function alphanumericSort(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true });
}
