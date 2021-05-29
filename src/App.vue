<template>
    <Cursor />
    <router-view></router-view>
</template>

<script lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import contextMenu from 'electron-context-menu';
import { useStore } from 'vuex';
import Cursor from '@/core/components/Cursor.vue';
import { mouseObjectManager } from '@/core/directives/mouse';
import { mediator } from '@/core/store/plugins/mediator/mediator';
import { persist } from '@/core/store/plugins/persist/persist';
import { shortcutManager } from '@/modules/shortcuts/directives/shortcut';

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

            mouseObjectManager.dispose();
            shortcutManager.dispose();
        });
    }
};
</script>
