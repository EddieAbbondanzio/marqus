<template>
    <div
        class="is-flex is-flex-column is-flex-grow-1"
        v-focusable:[focusName].hidden
        v-shortcut:undo="onUndo"
        v-shortcut:redo="onRedo"
    >
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { focusManager } from '@/directives/focusable';
import { undo } from '@/store/plugins/undo';
import { defineComponent } from 'vue';

/**
 * Wrapper component that will only perform an undo / redo if the user is focused
 * within it. Will also enable undo / redo shortcuts based on whatever the user
 * mapped them to.
 */
export default defineComponent({
    setup(p) {
        const m = undo.getModule(p.undoName);

        const onUndo = () => {
            if (focusManager.isFocused(p.focusName, true)) {
                if (m.canUndo()) {
                    m.undo();
                } else {
                    console.log('nothing to undo');
                }
            }
        };

        const onRedo = () => {
            if (focusManager.isFocused(p.focusName, true)) {
                if (m.canRedo()) {
                    console.log('redo');
                    m.redo();
                } else {
                    console.log('nothing to redo');
                }
            }
        };

        return {
            onUndo,
            onRedo
        };
    },
    props: {
        /**
         * Name of the undo module.
         */
        undoName: { type: String, required: true },
        /**
         * Name of the focusable.
         */
        focusName: { type: String, required: true }
    }
});
</script>
