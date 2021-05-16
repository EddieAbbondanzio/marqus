<template>
    <div id="cursor-dragging" class="is-absolute is-size-7" v-if="dragging">
        &nbsp;
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue';
import { mapState, useStore } from 'vuex';

export default defineComponent({
    setup() {
        const s = useStore();
        let cursorClass = 'has-cursor-default';

        const release = s.subscribe((m, s) => {
            switch (m.type) {
                case 'app/SET_CURSOR_ICON':
                    // Remove old one first
                    document.body.classList.remove(cursorClass);

                    cursorClass = `has-cursor-${m.payload}`;
                    document.body.classList.add(cursorClass);
                    break;

                case 'app/RESET_CURSOR_ICON':
                    // Remove old one first
                    document.body.classList.remove(cursorClass);

                    cursorClass = 'has-cursor-default';
                    document.body.classList.add(cursorClass);
                    break;
            }
        });

        const calculateCursorDraggingPosition = (e: MouseEvent) => {
            if (!s.state.app.cursor.dragging) return;

            const div = document.getElementById('cursor-dragging')!;

            div.style.left = `${e.pageX}px`;
            div.style.top = `${e.pageY - 20}px`;
        };

        onMounted(function() {
            document.addEventListener('mousemove', calculateCursorDraggingPosition);
        });

        onUnmounted(function() {
            release();
            document.removeEventListener('mousemove', calculateCursorDraggingPosition);
        });
    },
    computed: {
        ...mapState('app', { dragging: (s: any) => s.cursor.dragging })
    }
});
</script>

<style lang="sass">
#cursor-dragging
    pointer-events: none!important

.has-cursor-default
    cursor: default!important

.has-cursor-pointer
    *
        cursor: pointer!important

.has-cursor-ew-resize
    *
        cursor: ew-resize!important

.has-cursor-grabbing
    *
        cursor: grabbing!important
</style>
