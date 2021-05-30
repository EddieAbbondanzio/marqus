import { FocusManager } from '@/core/directives/focusable/focus-manager';
import { FOCUSABLE_ATTRIBUTE_NAME } from '@/core/directives/focusable/focusable';
import { Directive, DirectiveBinding } from '@vue/runtime-core';

export const focusManager = new FocusManager();

export const focusable: Directive = {
    mounted: (el: HTMLElement, binding: DirectiveBinding) => {
        const name = binding.arg;

        if (name == null) {
            throw Error('No name passed');
        }

        el.tabIndex = -1; // -1 allows focus via js but not tab key

        el.setAttribute(FOCUSABLE_ATTRIBUTE_NAME, name);
        focusManager.register(name, el);
    },
    beforeUnmount: (el: HTMLElement, binding: DirectiveBinding) => {
        const name = binding.arg;

        if (name == null) {
            throw Error('No name passed');
        }

        el.removeAttribute(FOCUSABLE_ATTRIBUTE_NAME);
        focusManager.remove(name);
    }
};
