export type StartsWith<
  Set,
  Needle extends string
> = Set extends `${Needle}${infer _C}` ? Set : never;

export type ElementOrWindow = HTMLElement | Window;
