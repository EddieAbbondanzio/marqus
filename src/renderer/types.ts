export type Action<Type extends string, Props = {}> = {
  [Property in keyof Props]: Props[Property];
} & { type: Type };
