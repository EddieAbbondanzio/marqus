<template>
    <Cursor />
    <router-view></router-view>
</template>

<script lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue';
import contextMenu from 'electron-context-menu';
import { useStore } from 'vuex';
import Cursor from '@/core/components/Cursor.vue';
import { mouseObjectManager } from '@/core/directives/mouse';
import { mediator } from '@/core/store/plugins/mediator/mediator';
import { persist } from '@/core/store/plugins/persist/persist';
import { shortcutManager } from '@/modules/shortcuts/directives/shortcut';
import { focusManager } from '@/core/directives/focusable';

export default {
    components: { Cursor },
    setup: () => {
        const s = useStore();

        onMounted(() => {
            persist.init(s);
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
