import { nextTick, Ref, ref } from "vue";
import { climbDomForMatch } from "./dom";
import { generateId } from "./id";

export const CONTEXT_ATTRIBUTE = "data-focusable";
export const CONTEXT_HIDDEN_ATTRIBUTE = "data-focusable-hidden";

export class Context {
  // eslint-disable-next-line
  constructor(
    public el: HTMLElement,
    public id: string,
    public name?: string
  ) {}

  containsElement(element: HTMLElement): boolean {
    return climbDomForMatch(element, el => el.getAttribute(CONTEXT_ATTRIBUTE) === this.id);
  }
}

const registered: Context[] = [];

/**
 * Event handler that determines if a new scope was focused.
 * @param event Event to handle.
 */
function onFocusIn(event: FocusEvent) {
  // We might need to climb up the dom tree to handle nested children of a scope.
  const scopeEl = climbDomForMatch(event.target as HTMLElement, el => el.hasAttribute(CONTEXT_ATTRIBUTE),
    { matchValue: el => el });

  if (scopeEl == null) {
    contexts.active.value = null;
  } else {
    const id = scopeEl.getAttribute(CONTEXT_ATTRIBUTE)!;
    contexts.active.value = registered.find(f => f.id === id)!;
  }
}

window.addEventListener("focusin", onFocusIn);

/**
 * Utility that helps track focused section of the app, and allows for changing focus
 * via a method call.
 */
export const contexts = {
  active: ref(null) as Ref<Context | null>,

  /**
   * Register a new HTML element that can be focused.
   * @param el The element
   */
  register(
    el: HTMLElement,
    opts: {
      hidden?: boolean;
      querySelector?: string;
      id?: string;
      name?: string;
    }
  ) {
    // Check for unique name first
    if (opts.name != null && registered.some(f => f.name === opts.name)) {
      throw Error(`Scope with name ${opts.name} already exists.`);
    }

    const id = opts.id ?? generateId();
    el.tabIndex = -1; // -1 allows focus via js but not tab key
    el.setAttribute(CONTEXT_ATTRIBUTE, id);

    // Check to see if we need to find a nested input within the scope.
    const element = opts.querySelector
      ? (el.querySelector(opts.querySelector) as HTMLElement)
      : el;

    const scope = new Context(element, id, opts.name);
    registered.push(scope);

    if (opts.hidden) {
      el.setAttribute(CONTEXT_HIDDEN_ATTRIBUTE, "true");
    }
  },

  /**
   * Remove a scope element from the manager.
   */
  remove(el: HTMLElement) {
    const id = el.getAttribute(CONTEXT_ATTRIBUTE);
    const toRemove = registered.findIndex(f => f.id === id);

    if (toRemove === -1) {
      throw Error("No scope found");
    }

    registered.splice(toRemove, 1);
    el.removeAttribute(CONTEXT_ATTRIBUTE);
  },

  isElementActive(el: HTMLElement): boolean {
    const allActiveFocusables = [];
    let element = this.active.value?.el ?? null;

    // Find all of the focusables that are currently active
    while (element != null) {
      const focusableId = element.getAttribute(CONTEXT_ATTRIBUTE);

      if (focusableId != null) {
        allActiveFocusables.push(contexts.findById(focusableId));
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
      throw Error("Id or name must be passed");
    }

    let scope;

    if (opts.id != null) {
      scope = registered.find(f => f.id === opts.id);
    } else {
      scope = registered.find(f => f.name === opts.name);
    }

    if (scope == null) {
      throw Error(`No scope with name ${opts.name} found.`);
    }

    // HACK. We gotta wait for the next tick or else the element doesn't exist yet
    (async () => {
      await nextTick();
      scope.el.focus();
    })();
  },
  findById(id: string) {
    return registered.find(f => f.id === id);
  },

  isFocused(name: string, checkNested = false) {
    if (contexts.active.value == null) {
      return false;
    }

    if (!checkNested) {
      return contexts.active.value.name === name;
    }

    const contains: boolean = climbDomForMatch(contexts.active.value.el, el => {
      const attr = el.getAttribute(CONTEXT_ATTRIBUTE);

      if (attr != null) {
        const scope = registered.find(f => f.id === attr);

        if (scope != null && scope.id === attr) {
          return true;
        }
      }

      return false;
    }
    );

    return contains;
  },

  /**
   * Release the event listener.
   */
  dispose() {
    window.removeEventListener("focusin", onFocusIn);
  }
};
