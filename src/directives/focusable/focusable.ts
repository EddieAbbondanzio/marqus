/*
 * These types had to be moved to a seperate file otherwise we create a circular dependency issue that causes the compiler
 * to throw a TypeError X is not a constructor error.
 */

import { climbDomHierarchy } from '@/shared/utils';

export const FOCUSABLE_ATTRIBUTE = 'data-focusable';

export class Focusable {
    constructor(public el: HTMLElement, public id: string, public name?: string, public parent?: Focusable) {}

    containsElement(element: HTMLElement): boolean {
        return climbDomHierarchy(element, {
            match: (el) => el.getAttribute(FOCUSABLE_ATTRIBUTE) === this.id
        });
    }
}
