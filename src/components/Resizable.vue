<template>
    <div class="resizable-wrapper" ref="wrapper" :style="style">
        <slot></slot>
        <div class="resizable-handle" @mousedown="onHandleMouseDown">&nbsp;</div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, getCurrentInstance, onMounted, onUnmounted, Ref, ref, watch } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
    setup(p, c) {
        let isResizing = false;

        const style = computed(() => ({ width: p.modelValue, minWidth: p.minWidth }));
        const store = useStore();

        const onHandleMouseDown = function(e: MouseEvent) {
            if (!isResizing) {
                isResizing = true;
                c.emit('resizeStart');
                store.commit('app/SET_CURSOR_ICON', 'ew-resize');

                e.stopPropagation();
            }
        };

        const wrapper = ref(null) as any;

        const onMouseMove = function(e: MouseEvent) {
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

                c.emit('update:modelValue', newWidth);
                e.stopPropagation();
            }
        };

        const onMouseUp = function(e: MouseEvent) {
            if (isResizing) {
                isResizing = false;
                store.commit('app/SET_CURSOR_ICON', 'default');

                c.emit('resizeStop');
                e.stopPropagation();
            }
        };

        onMounted(() => {
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        onUnmounted(() => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        });

        return {
            isResizing,
            style,
            onHandleMouseDown,
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
    methods: {},
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
