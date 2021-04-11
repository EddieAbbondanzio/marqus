import { Directive } from 'vue';

export const focus: Directive = {
    mounted(el, binding, vnode) {
        el.focus();
    }
};
