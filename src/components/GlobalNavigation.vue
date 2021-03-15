<template>
    <resizable v-model="width" @resizeStop="onResizeStop">
        <p class="has-text-dark">{{ width }}</p>
        <div class="has-h-100 has-text-dark">
            global
        </div>
    </resizable>
</template>

<script lang="ts">
import { computed, defineComponent, ref, WritableComputedRef } from 'vue';
import Resizable from '@/components/Resizable.vue';
import { useStore } from '@/store/store';
import { createNamespacedHelpers } from 'vuex';

export default defineComponent({
    components: { Resizable },
    setup() {
        const store = useStore();

        const width: WritableComputedRef<string> = computed({
            get: () => {
                return store.state.config['window.globalNavigation.width'] as string;
            },
            set: (v) => {
                store.commit('config/updateConfig', {
                    key: 'window.globalNavigation.width',
                    value: v
                });
            }
        });

        const onResizeStop = () => {
            store.dispatch('config/save');
        };

        return {
            width,
            onResizeStop
        };
    }
});
</script>
