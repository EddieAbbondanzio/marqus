<template>
    <div id="cursor-title" class="is-absolute is-size-7 has-background-transparent" style="left: -100px; top: -100px;">
        {{ title }}
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
    setup() {
        const s = useStore();
        const title = ref(null);

        s.subscribe((m, s) => {
            if (m.type === 'editor/SET_CURSOR_TITLE') {
                title.value = m.payload;
            } else if (m.type === 'editor/CLEAR_CURSOR_TITLE') {
                title.value = null;
            }
        });

        onMounted(function() {
            const div = document.getElementById('cursor-title')!;

            document.addEventListener('mousemove', function(e) {
                div.style.left = `${e.pageX + 8}px`;
                div.style.top = `${e.pageY + 8}px`;
            });
        });

        return {
            title
        };
    }
});
</script>
