import { inputScopes } from '@/directives/input-scope/input-scopes';
import { INPUT_SCOPE_ATTRIBUTE } from '@/directives/input-scope/scope';
import { Directive, DirectiveBinding } from '@vue/runtime-core';

/**
 * Directive to register elements as focusables. Useful for making shortcuts contextual, or
 * visually indicating where the users focus is.
 *
 * Example:
 * v-focusable:TEST_NAME -> Hidden focusable
 * v-focusable:globalNavigation.visible -> highlight element when active
 */
export const inputScope: Directive = {
    mounted: (el: HTMLElement, binding: DirectiveBinding) => {
        const name = binding.arg;

        const hidden = isHidden(binding.modifiers);
        const querySelector = binding.value != null ? binding.value.querySelector : null;

        inputScopes.register(el, { hidden, querySelector, name });
    },
    beforeUnmount: (el: HTMLElement, binding: DirectiveBinding) => {
        inputScopes.remove(el);
    }
};

function isHidden(modifiers: any) {
    if (modifiers.hidden != null && modifiers.visible != null) {
        throw Error('Hidden modifier may not be used with visible modifier at the same time');
    }

    if (modifiers.hidden) {
        return true;
    } else if (modifiers.visible == null) {
        return true;
    } else {
        return false;
    }
}
