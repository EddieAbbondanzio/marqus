<template>
    <div id="cursor-title" class="is-absolute is-size-7" style="left: -100px; top: -100px;" v-if="show">
        {{ title }}
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
    setup() {
        const s = useStore();
        const title = ref(null);
        const show = computed(() => title.value !== null);
        let cursorClass = 'has-cursor-default';

        const release = s.subscribe((m, s) => {
            switch (m.type) {
                case 'app/CURSOR_TITLE':
                    title.value = m.payload;
                    break;

                case 'app/CURSOR_TITLE_CLEAR':
                    title.value = null;
                    break;

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

        onMounted(function() {
            document.addEventListener('mousemove', function(e) {
                if (!show.value) return;

                const div = document.getElementById('cursor-title')!;

                div.style.left = `${e.pageX + 8}px`;
                div.style.top = `${e.pageY + 8}px`;
            });
        });

        onUnmounted(function() {
            release();
        });

        return {
            title,
            show
        };
    }
});
</script>

<style lang="sass">
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
