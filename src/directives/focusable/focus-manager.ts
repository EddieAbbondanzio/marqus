import { Focusable, FOCUSABLE_ATTRIBUTE_NAME } from '@/directives/focusable/focusable';
import { climbDomHierarchy } from '@/shared/utils';
import { nextTick } from 'vue';
/**
 * Utility that helps track focused section of the app, and allows for changing focus
 * via a method call.
 */
export class FocusManager {
    focusables: Focusable[] = [];
    active?: Focusable;

    constructor() {
        this.onFocusIn = this.onFocusIn.bind(this);
        window.addEventListener('focusin', this.onFocusIn);
    }

    /**
     * Register a new HTML element that can be focused.
     * @param name Easy to remember identifier of the element
     * @param el The element
     */
    register(name: string, el: HTMLElement, opts: { hidden: boolean; querySelector?: string } = { hidden: false }) {
        let parent;

        if (el.parentElement != null) {
            const focusableParentElement = climbDomHierarchy(el.parentElement, {
                match: (el) => el.hasAttribute(FOCUSABLE_ATTRIBUTE_NAME),
                matchValue: (el) => el
            });

            if (focusableParentElement != null) {
                const name = focusableParentElement.getAttribute(FOCUSABLE_ATTRIBUTE_NAME);

                parent = this.focusables.find(
                    (f) => f.name === focusableParentElement.getAttribute(FOCUSABLE_ATTRIBUTE_NAME)
                );
            }
        }

        // Check to see if we need to find a nested input within the focusable.
        const element = opts.querySelector ? (el.querySelector(opts.querySelector) as HTMLElement) : el;

        this.focusables.push({ name, el: element, parent });

        if (opts.hidden) {
            el.classList.add('focusable-hidden');
        }
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

        // HACK. We gotta wait for the next tick or else the element wont focus
        (async () => {
            await nextTick();
            focusable.el.focus();
        })();
    }

    isFocused(name: string, checkNested = false) {
        if (!checkNested) {
            return this.active?.name === name;
        }

        let curr = this.active;
        while (curr != null) {
            if (curr.name === name) {
                return true;
            }

            curr = curr.parent;
        }

        return false;
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

        console.log('focused: ', focusableEl);

        if (focusableEl == null) {
            delete this.active;
        } else {
            const name = focusableEl.getAttribute(FOCUSABLE_ATTRIBUTE_NAME)!;
            this.active = { name, el: focusableEl };
        }
    }
}
