import { UserInterfaceGetters } from "@/store/modules/ui/getters";
import { UserInterfaceMutations } from "@/store/modules/ui/mutations";
import { findParent, generateId } from "@/utils";
import { nextTick } from "vue";
import { Actions } from "vuex-smart-module";
import { Focusable, UserInterfaceState } from "./state";

export const FOCUSABLE_ATTRIBUTE = "data-focusable";
export const FOCUSABLE_HIDDEN_ATTRIBUTE = "data-focusable-hidden";

export type FocusableRegistration = Pick<Focusable, "directiveElement"> &
  Partial<Omit<Focusable, "id">>;

export class UserInterfaceActions extends Actions<
  UserInterfaceState,
  UserInterfaceGetters,
  UserInterfaceMutations,
  UserInterfaceActions
> {
  setState(state: UserInterfaceState) {
    this.commit("SET_STATE", state);
  }

  cursorDraggingStart() {
    this.commit("SET_CURSOR_ICON", "grabbing");
    this.commit("CURSOR_DRAGGING", true);
  }

  cursorDraggingStop() {
    this.commit("RESET_CURSOR_ICON");
    this.commit("CURSOR_DRAGGING", false);
  }

  registerFocusable(reg: FocusableRegistration) {
    // If no element to focus or query string was passed, default it.
    if (reg.focusElement == null) {
      reg.querySelector ??= "input";

      // Try to find the element we'll need to focus later on
      const focusElement = reg.directiveElement.querySelector(
        reg.querySelector
      );

      if (focusElement == null) {
        throw Error(
          `No element matches query string for v-focusable on ${reg.directiveElement}`
        );
      }

      reg.focusElement = focusElement as HTMLElement;
    }

    if (reg.name != null) {
      const existing = this.getters.focusableByName(reg.name);

      if (existing != null) {
        throw Error(`Focusable with name ${existing.name} already exists.`);
      }
    }

    const f: Focusable = {
      ...reg,
      id: generateId(),
    } as Focusable;

    // Assign some attributes to the directive element
    reg.directiveElement.setAttribute(FOCUSABLE_ATTRIBUTE, f.id);

    if (f.hidden) {
      f.directiveElement.setAttribute(FOCUSABLE_HIDDEN_ATTRIBUTE, String(true));
    }

    this.commit("ADD_FOCUSABLE", f);
  }

  isElementFocused(el: HTMLElement, checkNested = false): boolean {
    const allActiveFocusables = [];
    let element = this.state.active?.focusElement ?? null;

    // Find all of the focusables that are currently active
    while (element != null) {
      const focusableId = element.getAttribute(FOCUSABLE_ATTRIBUTE);

      if (focusableId != null) {
        allActiveFocusables.push(this.getters.focusableById(focusableId));
      }

      element = element.parentElement;
    }

    // Is the element within any of the elements that are currently focused?
    for (const focusable of allActiveFocusables) {
      if (
        findParent(
          el,
          (el) => el.getAttribute(FOCUSABLE_ATTRIBUTE) === focusable?.id
        )
      ) {
        return true;
      }
    }

    return false;
  }

  isFocused(name: string, checkNested = false) {
    if (this.state.active == null) {
      return false;
    }

    if (!checkNested) {
      return this.state.active.name === name;
    }

    const contains: boolean = findParent(
      this.state.active.focusElement!,
      (el) => {
        const attr = el.getAttribute(FOCUSABLE_ATTRIBUTE);

        if (attr != null) {
          const f = this.state.focusables.find((f) => f.id === attr);

          if (f != null && f.id === attr) {
            return true;
          }
        }

        return false;
      }
    );

    return contains;
  }

  removeFocusable(el: HTMLElement) {
    const id = el.getAttribute(FOCUSABLE_ATTRIBUTE)!;
    const f = this.getters.focusableById(id, { required: true });

    this.commit("REMOVE_FOCUSABLE", f);
  }

  focus(opts: { id?: string; name?: string }) {
    if (opts.id == null && opts.name == null) {
      throw Error("Id or name must be passed");
    }

    let scope;

    if (opts.id != null) {
      scope = this.getters.focusableById(opts.id, { required: true });
    } else {
      scope = this.getters.focusableByName(opts.name!, { required: true });
    }

    // HACK. We gotta wait for the next tick or else the element doesn't exist yet
    (async () => {
      await nextTick();
      scope.focusElement!.focus();
    })();
  }

  blurFocused() {
    this.commit("CLEAR_ACTIVE");
  }
}
