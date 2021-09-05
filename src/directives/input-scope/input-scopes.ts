import { InputScope, INPUT_SCOPE_ATTRIBUTE, INPUT_SCOPE_HIDDEN_ATTRIBUTE } from '@/directives/input-scope/scope';
import { climbDomHierarchy } from '@/shared/utils';
import { generateId } from '@/store';
import { nextTick, Ref, ref } from 'vue';

const scopes: InputScope[] = [];

/**
 * Event handler that determines if a new scope was focused.
 * @param event Event to handle.
 */
function onFocusIn(event: FocusEvent) {
    // We might need to climb up the dom tree to handle nested children of a scope.
    const scopeEl = climbDomHierarchy(event.target as HTMLElement, {
        match: (el) => el.hasAttribute(INPUT_SCOPE_ATTRIBUTE),
        matchValue: (el) => el
    });

    if (scopeEl == null) {
        inputScopes.active.value = null;
    } else {
        const id = scopeEl.getAttribute(INPUT_SCOPE_ATTRIBUTE)!;
        inputScopes.active.value = scopes.find((f) => f.id === id)!;
    }
}

window.addEventListener('focusin', onFocusIn);

/**
 * Utility that helps track focused section of the app, and allows for changing focus
 * via a method call.
 */
export const inputScopes = {
    active: ref(null) as Ref<InputScope | null>,

    /**
     * Register a new HTML element that can be focused.
     * @param el The element
     */
    register(el: HTMLElement, opts: { hidden?: boolean; querySelector?: string; id?: string; name?: string }) {
        let parent;

        // Check for unique name first
        if (opts.name != null && scopes.some((f) => f.name === opts.name)) {
            throw Error(`Scope with name ${opts.name} already exists.`);
        }

        const id = opts.id ?? generateId();
        el.tabIndex = -1; // -1 allows focus via js but not tab key
        el.setAttribute(INPUT_SCOPE_ATTRIBUTE, id);

        // Check to see if we need to find a nested input within the scope.
        const element = opts.querySelector ? (el.querySelector(opts.querySelector) as HTMLElement) : el;

        const scope = new InputScope(element, id, opts.name);
        scopes.push(scope);

        if (opts.hidden) {
            el.setAttribute(INPUT_SCOPE_HIDDEN_ATTRIBUTE, 'true');
        }
    },

    /**
     * Remove a scope element from the manager.
     */
    remove(el: HTMLElement) {
        const id = el.getAttribute(INPUT_SCOPE_ATTRIBUTE);
        const toRemove = scopes.findIndex((f) => f.id === id);

        if (toRemove === -1) {
            throw Error('No scope found');
        }

        scopes.splice(toRemove, 1);
        el.removeAttribute(INPUT_SCOPE_ATTRIBUTE);
    },

    isElementActive(el: HTMLElement): boolean {
        const allActiveFocusables = [];
        let element = this.active.value?.el ?? null;

        // Find all of the focusables that are currently active
        while (element != null) {
            const focusableId = element.getAttribute(INPUT_SCOPE_ATTRIBUTE);

            if (focusableId != null) {
                allActiveFocusables.push(inputScopes.findById(focusableId));
            }

            element = element.parentElement;
        }

        // Is the element within any of the elements that are currently focused?
        for (const focusable of allActiveFocusables) {
            if (focusable?.containsElement(el)) {
                return true;
            }
        }

        return false;
    },
    /**
     * Focus on a scope.
     * @param name The name of the element to focus.
     */
    focus(opts: { id?: string; name?: string }) {
        if (opts.id == null && opts.name == null) {
            throw Error('Id or name must be passed');
        }

        let scope;

        if (opts.id != null) {
            scope = scopes.find((f) => f.id === opts.id);
        } else {
            scope = scopes.find((f) => f.name === opts.name);
        }

        if (scope == null) {
            throw Error(`No scope with name ${opts.name} found.`);
        }

        // HACK. We gotta wait for the next tick or else the element wont focus
        (async () => {
            await nextTick();
            scope.el.focus();
        })();
    },
    findById(id: string) {
        return scopes.find((f) => f.id === id);
    },

    isFocused(name: string, checkNested = false) {
        if (inputScopes.active.value == null) {
            return false;
        }

        if (!checkNested) {
            return inputScopes.active.value.name === name;
        }

        const contains: boolean = climbDomHierarchy(inputScopes.active.value.el, {
            match: (el) => {
                const attr = el.getAttribute(INPUT_SCOPE_ATTRIBUTE);

                if (attr != null) {
                    const scope = scopes.find((f) => f.id === attr);

                    if (scope != null && scope.id === attr) {
                        return true;
                    }
                }

                return false;
            }
        });

        return contains;
    },

    /**
     * Release the event listener.
     */
    dispose() {
        window.removeEventListener('focusin', onFocusIn);
    }
};
