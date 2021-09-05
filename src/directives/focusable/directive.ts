import { focusManager } from '@/directives/focusable/focus-manager';
import { FOCUSABLE_ATTRIBUTE } from '@/directives/focusable/focusable';
import { Directive, DirectiveBinding } from '@vue/runtime-core';

/**
 * Directive to register elements as focusables. Useful for making shortcuts contextual, or
 * visually indicating where the users focus is.
 *
 * Example:
 * v-focusable:TEST_NAME -> Hidden focusable
 * v-focusable:globalNavigation.visible -> highlight element when active
 */
export const focusable: Directive = {
    mounted: (el: HTMLElement, binding: DirectiveBinding) => {
        const name = binding.arg;

        console.log(binding.modifiers);

        const hidden = isHidden(binding.modifiers);
        const querySelector = binding.value != null ? binding.value.querySelector : null;

        focusManager.register(el, { hidden, querySelector, name });
    },
    beforeUnmount: (el: HTMLElement, binding: DirectiveBinding) => {
        focusManager.remove(el);
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
