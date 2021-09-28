<template>
    <Cursor />
    <router-view></router-view>
</template>

<script lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import { useStore } from 'vuex';
import Cursor from '@/components/Cursor.vue';
import { mouseObjectManager } from '@/directives/mouse';
import { mediator } from '@/store/plugins/mediator/mediator';
import { persist } from '@/store/plugins/persist/persist';
import { shortcuts } from './utils/shortcuts/shortcuts';
import { DEFAULT_SHORTCUTS } from './utils/shortcuts/default-shortcuts';
import { inputScopes } from './utils/scopes';

export default {
    components: { Cursor },
    setup: () => {
        const s = useStore();

        onMounted(() => {
            persist.init(s);
            shortcuts.register(DEFAULT_SHORTCUTS as any);
        });

        onBeforeUnmount(() => {
            persist.release();
            mediator.release();

            inputScopes.dispose();
            mouseObjectManager.dispose();
            shortcuts.dispose();
        });
    }
};
</script>
