<template>
    <resizable v-model="width" @resizeStop="save">
        <p class="has-text-dark">{{ width }}</p>
        <div class="has-h-100 has-text-dark">global</div>
    </resizable>
</template>

<script lang="ts">
import { computed, defineComponent, getCurrentInstance, ref, WritableComputedRef, provide } from 'vue';
import Resizable from '@/components/Resizable.vue';
import { store } from '@/store/store';
import { useStore } from 'vuex';

export default defineComponent({
    setup: function() {
        const s = useStore();

        const width = computed({
            get: () => s.state.editor['window.globalNavigation.width'] as string,
            set: (v: any) => s.commit('editor/update', { key: 'window.globalNavigation.width', value: v })
        });

        const save = () => s.dispatch('editor/saveState');

        return {
            width,
            save
        };
    },
    components: { Resizable }
});
</script>
