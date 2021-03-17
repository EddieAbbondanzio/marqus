<template>
    <resizable v-model="width" @resizeStop="onResizeStop">
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

export default defineComponent({
    components: { Resizable },
    setup() {
        const width: WritableComputedRef<string> = computed({
            get: () => {
                return store.state.config['window.localNavigation.width'] as string;
            },
            set: (v) => {
                store.commit('config/updateConfig', {
                    key: 'window.localNavigation.width',
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
