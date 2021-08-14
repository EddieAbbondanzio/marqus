<template>
    <div ref="wrapper" class="scrollable-wrapper">
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

/**
 * Scrollable container that can be used to track scroll position via v-model.
 * Only supports vertical scrolling.
 */
export default defineComponent({
    setup(p, c) {
        const wrapper = ref(null! as HTMLDivElement);

        const onScroll = () => {
            c.emit('update:modelValue', wrapper.value.scrollTop);
        };

        onMounted(async () => {
            wrapper.value.scrollTop = p.modelValue;
            wrapper.value.addEventListener('scroll', onScroll);
        });

        const release = watch(
            () => p.modelValue,
            async (newVal) => {
                await nextTick(() => {
                    wrapper.value.scrollTop = newVal;
                });
            }
        );

        onUnmounted(() => {
            release();
            wrapper.value.removeEventListener('scroll', onScroll);
        });

        return {
            wrapper
        };
    },
    emits: ['update:modelValue'],
    props: {
        modelValue: {
            type: Number,
            default: 0
        }
    }
});
</script>

<style lang="sass" scoped>
.scrollable-wrapper
    overflow-x: hidden
    overflow-y: auto
    max-height: 100%
</style>
