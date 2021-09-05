/*
 * These types had to be moved to a seperate file otherwise we create a circular dependency issue that causes the compiler
 * to throw a TypeError X is not a constructor error.
 */

import { climbDomHierarchy } from '@/shared/utils';

export const INPUT_SCOPE_ATTRIBUTE = 'data-focusable';
export const INPUT_SCOPE_HIDDEN_ATTRIBUTE = 'data-focusable-hidden';

export class InputScope {
    constructor(public el: HTMLElement, public id: string, public name?: string) {}

    containsElement(element: HTMLElement): boolean {
        return climbDomHierarchy(element, {
            match: (el) => el.getAttribute(INPUT_SCOPE_ATTRIBUTE) === this.id
        });
    }
}
