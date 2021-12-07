export type Action<Type extends string, Props = {}> = {
  [Property in keyof Props]: Props[Property];
} & { type: Type };

export type StartsWith<
  Set,
  Needle extends string
> = Set extends `${Needle}${infer _C}` ? Set : never;
