<template>
    <div v-focusable:[focusName] v-shortcut:undo="onUndo" v-shortcut:redo="onRedo">
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { focusManager } from '@/directives/focusable';
import { undo } from '@/store/plugins/undo';
import { defineComponent } from 'vue';

export default defineComponent({
    setup(p) {
        const m = undo.getModule(p.undoName);

        const onUndo = () => {
            if (focusManager.isFocused(p.focusName)) {
                if (m.canUndo()) {
                    m.undo();
                } else {
                    console.log('nothing to undo');
                }
            }
        };

        const onRedo = () => {
            if (focusManager.isFocused(p.focusName)) {
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
        undoName: { type: String, required: true },
        focusName: { type: String, required: true }
    }
});
</script>
