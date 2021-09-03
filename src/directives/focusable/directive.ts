import { focusManager } from '@/directives/focusable/focus-manager';
import { FOCUSABLE_ATTRIBUTE } from '@/directives/focusable/focusable';
import { Directive, DirectiveBinding } from '@vue/runtime-core';

export const focusable: Directive = {
    mounted: (el: HTMLElement, binding: DirectiveBinding) => {
        const name = binding.arg;

        const hidden = binding.modifiers.hidden != null;
        const querySelector = binding.value != null ? binding.value.querySelector : null;

        focusManager.register(el, { hidden, querySelector, name });
    },
    beforeUnmount: (el: HTMLElement, binding: DirectiveBinding) => {
        focusManager.remove(el);
    }
};
