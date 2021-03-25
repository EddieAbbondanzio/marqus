<template>
    <resizable v-model="width" @resizeStop="save">
        <p class="has-text-dark">{{ width }}</p>
        <div class="has-h-100 has-text-dark">
            Local
        </div>
    </resizable>
</template>

<script lang="ts">
import { computed, defineComponent, ref, WritableComputedRef } from 'vue';
import Resizable from '@/components/Resizable.vue';
import { store } from '@/store/store';
import { useStore } from 'vuex';

export default defineComponent({
    setup: function() {
        const s = useStore();

        const width = computed({
            get: () => s.state.editor.localNavigation.width as string,
            set: (v: any) => s.commit('editor/UPDATE_STATE', { key: 'localNavigation.width', value: v })
        });

        const save = () => s.dispatch('editor/save');

        return {
            width,
            save
        };
    },
    components: { Resizable }
});
</script>
