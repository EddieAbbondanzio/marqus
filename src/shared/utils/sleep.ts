export function sleep(milliseconds: number): Promise<void> {
  return new Promise((res, rej) => {
    setTimeout(res, milliseconds);
  });
}
