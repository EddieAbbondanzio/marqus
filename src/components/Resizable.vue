<template>
    <div class="resizable-wrapper" ref="wrapper" :style="style">
        <slot></slot>
        <div class="resizable-handle" @mousedown="onHandleMouseDown">&nbsp;</div>
    </div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, onMounted, Ref, ref, watch } from 'vue';

export default defineComponent({
    setup(props) {
        const isResizing = false;

        return {
            isResizing
        };
    },
    mounted() {
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
    },
    computed: {
        style(): {} {
            return {
                width: this.$props.modelValue,
                minWidth: this.$props.minWidth
            };
        }
    },
    props: {
        modelValue: String,
        minWidth: {
            type: String,
            default: '100px'
        }
    },
    methods: {
        onHandleMouseDown(e: MouseEvent) {
            if (!this.isResizing) {
                this.isResizing = true;
                this.$emit('resizeStart');

                document.body.style.cursor = 'ew-resize';

                e.stopPropagation();
            }
        },
        onMouseMove(e: MouseEvent) {
            if (this.isResizing) {
                if (this.$refs.wrapper == null) {
                    throw new Error('No resizable container found');
                }

                const containerOffsetLeft = (this.$refs.wrapper as HTMLElement).offsetLeft;

                // Get x-coordinate of pointer relative to container
                const pointerRelativeXpos = e.clientX - containerOffsetLeft;

                // Arbitrary minimum width set on box A, otherwise its inner content will collapse to width of 0
                const boxAminWidth = 2;
                const newWidth = `${Math.max(boxAminWidth, pointerRelativeXpos)}px`;

                this.$emit('update:modelValue', newWidth);

                e.stopPropagation();
            }
        },
        onMouseUp(e: MouseEvent) {
            if (this.isResizing) {
                this.isResizing = false;
                this.$emit('resizeStop');
                document.body.style.cursor = 'pointer';

                e.stopPropagation();
            }
        }
    },
    emits: ['update:modelValue', 'resizeStart', 'resizeStop']
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
    cursor: ew-resize
    width: 2px
    background-color: black
    flex-grow: 0
</style>
