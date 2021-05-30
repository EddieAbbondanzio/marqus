import { focusable, FOCUSABLE_ATTRIBUTE_NAME } from '@/core/directives/focusable';
import { climbDomHierarchy } from '@/utils/dom/climb-dom-hierarchy';

/**
 * Utility that helps track focused section of the app, and allows for changing focus
 * via a method call.
 */
export class FocusManager {
    focusables: { name: string; el: HTMLElement }[] = [];
    onChange?: (name?: string | null, el?: HTMLElement | null) => any;

    constructor() {
        this.onFocusIn = this.onFocusIn.bind(this);
        window.addEventListener('focusin', this.onFocusIn);
    }

    /**
     * Register a new HTML element that can be focused.
     * @param name Easy to remember identifier of the element
     * @param el The element
     */
    register(name: string, el: HTMLElement) {
        this.focusables.push({ name, el });
    }

    /**
     * Remove a focusable element from the manager.
     * @param name The name of the element to remove.
     */
    remove(name: string) {
        this.focusables = this.focusables.filter((f) => f.name !== name);
    }

    /**
     * Focus on a focusable html element.
     * @param name The name of the element to focus.
     */
    focus(name: string) {
        const focusable = this.focusables.find((f) => f.name === name);

        if (focusable == null) {
            throw Error(`No focusable with name ${name} found.`);
        }

        focusable.el.focus();
    }

    /**
     * Release the event listener.
     */
    dispose() {
        window.removeEventListener('focusin', this.onFocusIn);
    }

    /**
     * Event handler that determines if a new focusable was focused.
     * @param event Event to handle.
     */
    onFocusIn(event: FocusEvent) {
        // We might need to climb up the dom tree to handle nested children of a focusable.
        const focusableEl = climbDomHierarchy(event.target as HTMLElement, {
            match: (el) => el.hasAttribute(FOCUSABLE_ATTRIBUTE_NAME),
            matchValue: (el) => el
        });

        const focusableName = focusableEl?.getAttribute(FOCUSABLE_ATTRIBUTE_NAME);

        // Notify subscriber (if any).
        if (this.onChange != null) {
            this.onChange(focusableName, focusableEl);
        }
    }
}
