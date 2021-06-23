<template>
    <Cursor />
    <router-view></router-view>
</template>

<script lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue';
import contextMenu from 'electron-context-menu';
import { useStore } from 'vuex';
import Cursor from '@/components/Cursor.vue';
import { mouseObjectManager } from '@/directives/mouse';
import { mediator } from '@/store/plugins/mediator/mediator';
import { persist } from '@/store/plugins/persist/persist';
import { shortcutManager } from '@/features/shortcuts/directives/shortcut';
import { focusManager } from '@/directives/focusable';
import { undo } from '@/store/plugins/undo/undo';
export default {
    components: { Cursor },
    setup: () => {
        const s = useStore();

        onMounted(() => {
            persist.init(s);
            undo.init();
        });

        onBeforeUnmount(() => {
            persist.release();
            mediator.release();

            focusManager.dispose();
            mouseObjectManager.dispose();
            shortcutManager.dispose();
        });
    }
};
</script>
