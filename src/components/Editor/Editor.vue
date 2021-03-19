<template>
    <div class="has-background-light is-flex-grow-1 has-text-dark">
        <editor-toolbar />
        <textarea class="has-w-100 has-h-100" v-if="mode === 'edit'" />
        <div class="content" v-else></div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import EditorToolbar from '@/components/Editor/EditorToolbar.vue';
import { store } from '@/store/store';

export default defineComponent({
    components: {
        EditorToolbar
    },
    computed: {
        mode: () => store.state.editor.mode
    }
});
</script>

<style lang="sass" scoped>
textarea
    outline: none!important
    border: none!important
</style>
