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
