<template>
    <Cursor />
    <router-view></router-view>
</template>

<script lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import contextMenu from 'electron-context-menu';
import { useStore } from 'vuex';
import Cursor from '@/components/core/Cursor.vue';
import { persist } from '@/store/plugins/persist/persist';

export default {
    components: { Cursor },
    setup: () => {
        const s = useStore();

        onMounted(() => {
            persist.init(s);
        });

        onBeforeUnmount(() => {
            persist.release();
        });
    }
};
</script>
