<template>
    <div class="has-background-light is-flex-grow-1 has-text-dark">
        <editor-toolbar />
        <p class="has-text-dark">Editor</p>
        <i class="fab fa-medium"></i>
        <i class="far fa-envelope"></i>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import EditorToolbar from '@/components/Editor/EditorToolbar.vue';

export default defineComponent({
    components: {
        EditorToolbar
    }
});
</script>
