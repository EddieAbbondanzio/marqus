/*
 * These types had to be moved to a seperate file otherwise we create a circular dependency issue that causes the compiler
 * to throw a TypeError X is not a constructor error.
 */

export const FOCUSABLE_ATTRIBUTE_NAME = 'data-focusable';

export type Focusable = { name: string; el: HTMLElement };
