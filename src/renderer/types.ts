import { RefObject } from "react";

export type StartsWith<
  Set,
  Needle extends string
> = Set extends `${Needle}${infer _C}` ? Set : never;

export type ElementOrWindow = RefObject<HTMLElement> | Window;

export function isRef<R>(val: unknown): val is RefObject<R> {
  return (val as any).hasOwnProperty("current");
}
