export function isBlank(str?: string): boolean {
  return str == null || /^\s*$/.test(str);
}

export function sleep(milliseconds: number): Promise<void> {
  return new Promise((res) => {
    setTimeout(res, milliseconds);
  });
}
