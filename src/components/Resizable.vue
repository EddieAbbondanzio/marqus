<template>
    <div class="resizable-wrapper" ref="wrapper" :style="styles">
        <slot></slot>
        <div class="resizable-handle">&nbsp;</div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, watch } from 'vue';

export default defineComponent({
    setup(props, { emit }) {
        let isResizing = false;
        const wrapper = (ref(null) as any) as Ref<HTMLElement>;
        let styles: { width: string } = { width: null! }; // eslint-disable-line

        onMounted(() => {
            wrapper.value.style.minWidth = props.minWidth!;
            wrapper.value.style.width = props.modelValue!;
            styles.width = props.modelValue!;

            wrapper.value.addEventListener('mousedown', () => {
                if (!isResizing) {
                    isResizing = true;
                    emit('resizeStart');
                }
            });

            document.addEventListener('mouseup', (e) => {
                if (isResizing) {
                    isResizing = false;
                    emit('resizeStop');
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

                    const newWidth = `${Math.max(boxAminWidth, pointerRelativeXpos)}px`;

                    emit('update:modelValue', newWidth);
                    styles.width = newWidth;
                    emit('resizeMove', newWidth);
                }
            });
        });

        watch(
            () => props.modelValue,
            (v) => {
                styles.width = v!;
            }
        );

        return {
            isResizing,
            wrapper,
            styles
        };
    },
    props: {
        modelValue: String,
        minWidth: {
            type: String,
            default: '100px'
        }
    },
    emits: ['update:modelValue', 'resizeStart', 'resizeMove', 'resizeStop']
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
