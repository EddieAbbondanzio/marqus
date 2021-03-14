<template>
    <div class="resizable-wrapper" ref="wrapper">
        <template />
        <div class="resizable-handle">&nbsp;</div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';

export default defineComponent({
    setup(props, { emit }) {
        let isResizing = false;
        const wrapper = (ref(null) as any) as Ref<HTMLElement>;

        onMounted(() => {
            (wrapper.value.parentElement!.firstElementChild as HTMLElement)!.style.width = props.modelValue!;

            wrapper.value.addEventListener('mousedown', () => {
                if (!isResizing) {
                    isResizing = true;
                }
            });

            document.addEventListener('mouseup', () => {
                if (isResizing) {
                    isResizing = false;
                }
            });

            document.addEventListener('mousemove', (e) => {
                if (isResizing) {
                    const resizeWrapper = wrapper.value.parentElement!.firstElementChild as HTMLElement;

                    if (resizeWrapper == null) {
                        throw new Error('No resizable container found');
                    }

                    const containerOffsetLeft = resizeWrapper.offsetLeft;

                    // Get x-coordinate of pointer relative to container
                    const pointerRelativeXpos = e.clientX - containerOffsetLeft;

                    // Arbitrary minimum width set on box A, otherwise its inner content will collapse to width of 0
                    const boxAminWidth = 2;

                    // Resize box A
                    // * 8px is the left/right spacing between .handler and its inner pseudo-element
                    // * Set flex-grow to 0 to prevent it from growing
                    const newWidth = `${Math.max(boxAminWidth, pointerRelativeXpos)}px`;
                    resizeWrapper.style.width = newWidth;

                    emit('update:modelValue', newWidth);
                }
            });
        });

        return {
            isResizing,
            wrapper
        };
    },
    props: {
        modelValue: String
    },
    emits: ['update:modelValue']
});
</script>

<style lang="sass" scoped>
.resizable-wrapper
    flex-grow: 0

.resizable-handle
    height: 100%
    cursor: ew-resize
</style>
