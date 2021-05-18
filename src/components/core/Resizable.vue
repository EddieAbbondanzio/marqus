<template>
    <div class="resizable-wrapper" ref="wrapper" :style="style">
        <div style="max-width: calc(100% - 2px);">
            <slot></slot>
        </div>
        <div
            class="resizable-handle"
            v-mouse:hold.left="onHandleMouseDown"
            v-mouse:drag.left="onMouseMove"
            v-mouse:release.left="onMouseUp"
        >
            &nbsp;
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, getCurrentInstance, onMounted, onUnmounted, Ref, ref, watch } from 'vue';
import { useStore } from 'vuex';

/**
 * Horizontal resizable that allows content to be dragged via the mouse to adjust it's width.
 */
export default defineComponent({
    setup(p, c) {
        const style = computed(() => ({ width: p.modelValue, minWidth: p.minWidth }));
        const store = useStore();

        const minWidthInt = Number.parseInt(p.minWidth.split('px')[0], 10); // Hack. Assume it came in as 'XXpx'

        const onHandleMouseDown = function() {
            c.emit('resizeStart');
            store.commit('app/SET_CURSOR_ICON', 'ew-resize');
        };

        const wrapper = ref(null) as any;

        const onMouseMove = function(event: MouseEvent) {
            if (wrapper == null) {
                throw new Error('No resizable container found');
            }

            const containerOffsetLeft = wrapper.value.offsetLeft;

            // Get x-coordinate of pointer relative to container
            const pointerRelativeXpos = event.clientX - containerOffsetLeft;

            const newWidth = `${Math.max(minWidthInt, pointerRelativeXpos)}px`;

            c.emit('update:modelValue', newWidth);
        };

        const onMouseUp = function() {
            store.commit('app/SET_CURSOR_ICON', 'default');
            c.emit('resizeStop');
        };

        return {
            style,
            onHandleMouseDown,
            onMouseMove,
            onMouseUp,
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
