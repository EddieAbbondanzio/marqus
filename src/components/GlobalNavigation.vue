<template>
    <resizable class="has-text-dark" v-model="width" @resizeStop="save">
        <ul>
            <li class="is-uppercase">All</li>
            <li class="is-uppercase">Notebooks</li>
            <li class="is-uppercase">Tags</li>
            <li class="is-uppercase">Favorites</li>
            <li class="is-uppercase">Trash</li>
        </ul>
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
