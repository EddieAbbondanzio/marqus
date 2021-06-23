import { ShortcutManager } from '@/features/shortcuts/common/shortcut-manager';
import { ShortcutCallback } from '@/features/shortcuts/common/shortcut-subscriber';
import { DirectiveBinding } from 'vue';

export type ShortcutDirectiveValue = ShortcutCallback | { callback: ShortcutCallback; when: () => boolean };

export const shortcutManager: ShortcutManager = new ShortcutManager();

export const shortcut = {
    beforeMount: function(el: HTMLElement, binding: DirectiveBinding) {
        const shortcutName = binding.arg;

        if (shortcutName == null) {
            throw Error('No shortcut name specified.');
        }

        const value: ShortcutDirectiveValue = binding.value;

        if (value == null) {
            throw Error('No callback for the shortcut specified.');
        }

        let callback;
        let when;

        if (typeof value === 'function') {
            callback = value;
        } else {
            callback = value.callback;
            when = value.when;
        }

        shortcutManager.subscribe(shortcutName, callback, { el, when });
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
