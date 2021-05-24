import { parseKey } from '@/directives/shortcut/key-code';
import { ShortcutManager } from '@/directives/shortcut/shortcut-manager';
import { DirectiveBinding } from 'vue';

export const shortcutManager: ShortcutManager = new ShortcutManager();

export const shortcut = {
    beforeMount: function(el: HTMLElement, binding: DirectiveBinding) {
        const shortcutName = binding.arg;

        if (shortcutName == null) {
            throw Error('No shortcut name specified.');
        }

        const callback = binding.value;

        if (callback == null) {
            throw Error('No callback for the shortcut specified.');
        }

        const subscriber = shortcutManager.subscribe(shortcutName, callback);
        (el as any).subscriber = subscriber;
    },
    unmounted: function(el: HTMLElement, binding: DirectiveBinding) {
        const subscriber = (el as any).subscriber;

        if (subscriber == null) {
            throw Error('No subscriber to remove');
        }

        shortcutManager.unsubscribe(subscriber);
        delete (el as any).subscriber;
    }
};
