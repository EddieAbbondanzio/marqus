<template>
    <div
        id="cursor-title"
        class="is-absolute is-size-7 has-background-transparent"
        style="left: -100px; top: -100px;"
        v-if="show"
    >
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

        const release = s.subscribe((m, s) => {
            switch (m.type) {
                case 'app/SET_CURSOR_TITLE':
                    title.value = m.payload;
                    console.log('title was set!');
                    break;

                case 'app/CLEAR_CURSOR_TITLE':
                    title.value = null;
                    break;

                case 'app/SET_CURSOR_ICON':
                    document.body.style.cursor = m.payload;
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
