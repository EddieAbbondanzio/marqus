<template>
    <div class="resizable-wrapper" ref="wrapper">
        <slot></slot>
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
            wrapper.value.style.minWidth = props.minWidth!;

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
                    if (wrapper == null) {
                        throw new Error('No resizable container found');
                    }

                    const containerOffsetLeft = wrapper.value.offsetLeft;

                    // Get x-coordinate of pointer relative to container
                    const pointerRelativeXpos = e.clientX - containerOffsetLeft;

                    // Arbitrary minimum width set on box A, otherwise its inner content will collapse to width of 0
                    const boxAminWidth = 2;

                    // Resize box A
                    // * 8px is the left/right spacing between .handler and its inner pseudo-element
                    // * Set flex-grow to 0 to prevent it from growing
                    const newWidth = `${Math.max(boxAminWidth, pointerRelativeXpos)}px`;
                    wrapper.value.style.width = newWidth;

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
        modelValue: String,
        minWidth: {
            type: String,
            default: '100px'
        }
    },
    emits: ['update:modelValue']
});
</script>

<style lang="sass" scoped>
.resizable-wrapper
    display: flex
    flex-direction: row
    background-color: transparent

    & > :first-child
        flex-grow: 1

.resizable-handle
    height: 100%
    width: 2px
    cursor: ew-resize
    background-color: black
    flex-grow: 0
</style>
