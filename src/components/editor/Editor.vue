<template>
    <div class="has-background-light is-flex-grow-1 has-text-dark">
        <editor-toolbar />
        <textarea class="has-w-100 has-h-100" v-if="mode === 'edit'" />
        <div class="content" v-else></div>
    </div>

    {{ notebooks }}
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue';
import EditorToolbar from '@/components/editor/EditorToolbar.vue';
import { store } from '@/store';
import { useStore } from 'vuex';

export default defineComponent({
    setup: (p, c) => {
        const s = useStore();
        const notebooks = computed(() =>
            s.state.notebooks.values.map((n: any) => ({ name: n.value, expanded: n.expanded }))
        );

        return {
            notebooks
        };
    },
    components: {
        EditorToolbar
    },
    computed: {
        mode: () => ''
    }
});
</script>

<style lang="sass" scoped>
textarea
    outline: none!important
    border: none!important
</style>
