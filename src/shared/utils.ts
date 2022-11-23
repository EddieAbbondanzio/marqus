export function isBlank(str?: string): boolean {
  return str == null || /^\s*$/.test(str);
}

export function sleep(milliseconds: number): Promise<void> {
  return new Promise(res => {
    setTimeout(res, milliseconds);
  });
}

// Source: https://stackoverflow.com/a/37563868
export const ISO_8601_REGEX =
  /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?/i;
