import { Focusable, FOCUSABLE_ATTRIBUTE } from '@/directives/focusable/focusable';
import { climbDomHierarchy } from '@/shared/utils';
import { generateId } from '@/store';
import { nextTick, Ref, ref } from 'vue';

let focusables: Focusable[] = [];

/**
 * Event handler that determines if a new focusable was focused.
 * @param event Event to handle.
 */
function onFocusIn(event: FocusEvent) {
    // We might need to climb up the dom tree to handle nested children of a focusable.
    const focusableEl = climbDomHierarchy(event.target as HTMLElement, {
        match: (el) => el.hasAttribute(FOCUSABLE_ATTRIBUTE),
        matchValue: (el) => el
    });

    if (focusableEl == null) {
        focusManager.active.value = null;
    } else {
        const id = focusableEl.getAttribute(FOCUSABLE_ATTRIBUTE)!;
        focusManager.active.value = focusables.find((f) => f.id === id)!;
    }
}

window.addEventListener('focusin', onFocusIn);

/**
 * Utility that helps track focused section of the app, and allows for changing focus
 * via a method call.
 */
export const focusManager = {
    active: ref(null) as Ref<Focusable | null>,

    /**
     * Register a new HTML element that can be focused.
     * @param el The element
     */
    register(el: HTMLElement, opts: { hidden?: boolean; querySelector?: string; id?: string; name?: string }) {
        let parent;

        if (el.parentElement != null) {
            const focusableParentElement = climbDomHierarchy(el.parentElement, {
                match: (el) => el.hasAttribute(FOCUSABLE_ATTRIBUTE),
                matchValue: (el) => el
            });

            if (focusableParentElement != null) {
                const id = focusableParentElement.getAttribute(FOCUSABLE_ATTRIBUTE);
                parent = focusables.find((f) => f.id === id);
            }
        }

        const id = opts.id ?? generateId();

        el.tabIndex = -1; // -1 allows focus via js but not tab key
        el.setAttribute(FOCUSABLE_ATTRIBUTE, id);

        // Check to see if we need to find a nested input within the focusable.
        const element = opts.querySelector ? (el.querySelector(opts.querySelector) as HTMLElement) : el;

        const focusable = new Focusable(element, id, opts.name, parent);

        focusables.push(focusable);

        if (opts.hidden) {
            el.classList.add('focusable-hidden');
        }
    },

    /**
     * Remove a focusable element from the manager.
     */
    remove(el: HTMLElement) {
        const id = el.getAttribute(FOCUSABLE_ATTRIBUTE);
        const toRemove = focusables.find((f) => f.id === id);

        if (toRemove == null) {
            throw Error('No focusable found');
        }

        focusables = focusables.filter((f) => f.name !== name);
        toRemove.el.removeAttribute(FOCUSABLE_ATTRIBUTE);
    },

    /**
     * Focus on a focusable html element.
     * @param name The name of the element to focus.
     */
    focus(opts: { id?: string; name?: string }) {
        if (opts.id == null && opts.name == null) {
            throw Error('Id or name must be passed');
        }

        let focusable;

        if (opts.id != null) {
            focusable = focusables.find((f) => f.id === opts.id);
        } else {
            focusable = focusables.find((f) => f.name === opts.name);
        }

        if (focusable == null) {
            throw Error(`No focusable with name ${name} found.`);
        }

        // HACK. We gotta wait for the next tick or else the element wont focus
        (async () => {
            await nextTick();
            focusable.el.focus();
        })();
    },

    isFocused(name: string, checkNested = false) {
        if (focusManager.active.value == null) {
            return false;
        }

        if (!checkNested) {
            return focusManager.active.value.name === name;
        }

        let curr = focusManager.active.value;
        while (curr != null) {
            if (curr.name === name) {
                return true;
            }

            curr = curr.parent!;
        }

        return false;
    },

    /**
     * Release the event listener.
     */
    dispose() {
        window.removeEventListener('focusin', onFocusIn);
    }
};
