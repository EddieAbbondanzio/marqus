export interface Coord {
  x: number;
  y: number;
}

export function px(num: number): string {
  return `${num}px`;
}

export function isPx(raw: string): boolean {
  return /^\d+px$/.test(raw);
}

export function getPx(raw: string): number {
  if (!isPx(raw)) {
    throw Error("Invalid strng format. Expected: 123px");
  }

  return Number.parseInt(raw.split("px")[0], 10);
}

export function percentage(num: number): string {
  return `${num}%`;
}

export function isPercentage(raw: string): boolean {
  return /^[0-9]{1,2}\%$|^100\%$/.test(raw);
}

export function getPercentage(raw: string): number {
  if (!isPercentage(raw)) {
    throw Error("Invalid strng format. Expected: 60%");
  }

  return Number.parseInt(raw.split("px")[0], 10);
}

export const classList = (
  ...classes: Array<string | undefined>
): Readonly<string> => classes.filter((c) => c != null).join(" ");
