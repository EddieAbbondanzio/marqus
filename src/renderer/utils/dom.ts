import { chain } from "lodash";

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

export function hexToRgba(hex: string, a: number) {
  // Source: https://stackoverflow.com/a/21648508
  let c: any;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split("");
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = "0x" + c.join("");
    return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(
      ","
    )}, ${a})`;
  }
  throw new Error("Bad Hex");
}
