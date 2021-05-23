import { parseKey } from '@/directives/shortcut/key-code';
import { DirectiveBinding } from 'vue';

export const shortcut = {
    beforeMount: function(el: HTMLElement, binding: DirectiveBinding) {
        window.addEventListener('keydown', (e: KeyboardEvent) => {
            console.log('key: ', e.code);
        });
    }
};
