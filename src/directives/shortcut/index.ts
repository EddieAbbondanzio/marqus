import { parseKey } from '@/directives/shortcut/key-code';
import { ShortcutManager } from '@/directives/shortcut/shortcut-manager';
import { DirectiveBinding } from 'vue';

export * from './key-code';
export * from './shortcut';
export * from './shortcut-manager';
export * from './shortcut-subscriber';

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

        shortcutManager.subscribe(shortcutName, callback, el);
    },
    unmounted: function(el: HTMLElement, binding: DirectiveBinding) {
        const subscribers = shortcutManager.getSubscribersByElement(el);
        const subscriber = subscribers.find((s) => s.shortcutName === binding.arg);

        if (subscriber == null) {
            throw Error('No subscriber to remove');
        }

        shortcutManager.unsubscribe(subscriber);
    }
};
