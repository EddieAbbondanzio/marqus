<template>
    <div class="has-background-light is-flex-grow-1 has-text-dark">
        <editor-tabs />
        <editor-toolbar />
        <div class="content"></div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue';
import EditorTabs from '@/components/editor/EditorTabs.vue';
import EditorToolbar from '@/components/editor/EditorToolbar.vue';
import { store } from '@/store';
import { useStore } from 'vuex';

export default defineComponent({
    setup: (p, c) => {
        const s = useStore();
    },
    components: {
        EditorToolbar,
        EditorTabs
    }
});
</script>

<style lang="sass" scoped>
textarea
    outline: none!important
    border: none!important
</style>
