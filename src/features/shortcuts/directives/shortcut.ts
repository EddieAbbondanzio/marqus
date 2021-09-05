import { InputScope, INPUT_SCOPE_ATTRIBUTE, inputScopes } from '@/directives/input-scope';
import { shortcuts } from '@/features/shortcuts/shared/shortcuts';
import { ShortcutCallback } from '@/features/shortcuts/shared/shortcut-subscriber';
import { climbDomHierarchy } from '@/shared/utils';
import { DirectiveBinding } from 'vue';

export const shortcut = {
    beforeMount: function(el: HTMLElement, binding: DirectiveBinding) {
        const shortcutName = binding.arg;

        if (shortcutName == null) {
            throw Error('No shortcut name specified.');
        }

        const callback: ShortcutCallback = binding.value;

        if (callback == null) {
            throw Error('No callback for the shortcut specified.');
        }

        // Is it a context based shortcut?
        let when: (() => boolean) | undefined;
        if (!binding.modifiers.global) {
            when = () => {
                const allActiveFocusables = [];
                let element = inputScopes.active.value?.el ?? null;

                // Find all of the focusables that are currently active
                while (element != null) {
                    const focusableId = element.getAttribute(INPUT_SCOPE_ATTRIBUTE);

                    if (focusableId != null) {
                        allActiveFocusables.push(inputScopes.findById(focusableId));
                    }

                    element = element.parentElement;
                }

                // Is the shortcut directive on an element that is currently focused?
                for (const focusable of allActiveFocusables) {
                    if (focusable?.containsElement(el)) {
                        return true;
                    }
                }

                return false;
            };
        }

        shortcuts.subscribe(shortcutName, callback, { el, when });
    },
    unmounted: function(el: HTMLElement, binding: DirectiveBinding) {
        const subscribers = shortcuts.getSubscribersByElement(el);
        const subscriber = subscribers.find((s) => s.shortcutName === binding.arg);

        if (subscriber == null) {
            throw Error('No subscriber to remove');
        }

        shortcuts.unsubscribe(subscriber);
    }
};
