<template>
    <!-- @keydown.space.prevent stops spacebar from scrolling down -->
    <div ref="wrapper" class="scrollable-wrapper" @keydown.space.prevent>
        <slot></slot>
    </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { defineComponent, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

/**
 * Scrollable container that can be used to track scroll position via v-model.
 * Only supports vertical scrolling.
 */
export default defineComponent({
    setup(p, c) {
        const wrapper = ref(null! as HTMLDivElement);

        // const release = () => 1 as any;
        const release = watch(
            () => p.modelValue,
            async (newVal) => {
                await nextTick(() => {
                    const maxScroll = wrapper.value.scrollHeight - wrapper.value.clientHeight;
                    const clamped = _.clamp(newVal, 0, maxScroll);

                    if (clamped !== newVal) {
                        c.emit('update:modelValue', clamped);
                    }

                    wrapper.value.scrollTop = newVal;
                });
            }
        );

        const onScroll = (e: Event) => {
            c.emit('update:modelValue', wrapper.value.scrollTop);
        };

        onMounted(async () => {
            wrapper.value.scrollTop = p.modelValue;
            wrapper.value.addEventListener('scroll', onScroll);
        });

        onUnmounted(() => {
            release();

            if (wrapper.value != null) {
                wrapper.value.removeEventListener('scroll', onScroll);
            }
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
    overflow-y: scroll
    max-height: 100%
    height: 100%
</style>
