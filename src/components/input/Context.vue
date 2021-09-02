<template> </template>

<script lang="ts">
import { focusManager } from '@/directives/focusable/focus-manager';
import { shortcutManager } from '@/features/shortcuts/directives/shortcut';
import { defineComponent, watch } from 'vue';

export default defineComponent({
    setup(p) {
        const shortcutSubscriber = () => {
            if (p.name == null) {
                throw Error(`Cannot call focus if no name passed.`);
            }

            focusManager.focus({ name: p.name });
        };

        watch(
            () => p.focusShortcut,
            (value, oldValue) => {
                if (shortcutSubscriber != null) {
                    shortcutManager.unsubscribe(shortcutSubscriber);
                }

                if (value != null) {
                    shortcutManager.subscribe(value);
                }
            }
        );
    },
    props: {
        name: String,
        focusShortcut: String
    }
});
</script>
