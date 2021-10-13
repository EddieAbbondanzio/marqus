import { store } from "@/store";
import { userInterface } from "@/store/modules/ui";
import { generateId, findParent } from "@/utils";
import { DirectiveDefinition } from "@/utils/vue";
import { Directive, DirectiveBinding } from "@vue/runtime-core";
import { nextTick, ref, Ref } from "vue";

const { registerFocusable, removeFocusable } =
  userInterface.context(store).actions;

/**
 * Directive to register elements as focusables. Useful for making shortcuts contextual, or
 * visually indicating where the users focus is.
 *
 * Example:
 * v-focusable -> Nameless scope that can be focused
 * v-focusable:TEST_NAME -> Scope that can be referenced via it's name "TEST_NAME"
 * v-focusable:globalNavigation.visible -> highlight element when active
 */
export const focusable: DirectiveDefinition = [
  "focusable",
  {
    mounted: (directiveElement: HTMLElement, binding: DirectiveBinding) => {
      const name = binding.arg;

      const hidden = isHidden(binding.modifiers);
      const querySelector = binding.value.querySelector ?? "input";

      registerFocusable({
        directiveElement,
        hidden,
        querySelector,
        name,
      });
    },
    beforeUnmount: (el: HTMLElement) => removeFocusable(el),
  },
];

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
