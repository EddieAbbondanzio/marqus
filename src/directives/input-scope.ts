import { contexts } from "@/utils";
import { Directive, DirectiveBinding } from "@vue/runtime-core";

/**
 * Directive to register elements as focusables. Useful for making shortcuts contextual, or
 * visually indicating where the users focus is.
 *
 * Example:
 * v-context -> Nameless scope that can be focused
 * v-context:TEST_NAME -> Scope that can be referenced via it's name "TEST_NAME"
 * v-context:globalNavigation.visible -> highlight element when active
 */
export const context: Directive = {
  mounted: (el: HTMLElement, binding: DirectiveBinding) => {
    const name = binding.arg;

    const hidden = isHidden(binding.modifiers);
    const querySelector =
      binding.value != null ? binding.value.querySelector : null;

    contexts.register(el, { hidden, querySelector, name });
  },
  beforeUnmount: (el: HTMLElement) => contexts.remove(el)
};

function isHidden(modifiers: any) {
  if (modifiers.hidden != null && modifiers.visible != null) {
    throw Error(
      "Hidden modifier may not be used with visible modifier at the same time"
    );
  }

  if (modifiers.hidden) {
    return true;
  } else if (modifiers.visible == null) {
    return true;
  } else {
    return false;
  }
}
