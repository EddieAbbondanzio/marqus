<template>
    <textarea class="editor-textarea p-3" :value="content" @input="onInput"></textarea>
</template>

<script lang="ts">
import { useEditor } from '@/features/ui/store/modules/editor';
import { computed, defineComponent, ref, watch } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
    setup: () => {
        const editor = useEditor();

        const content = computed({
            get: () => editor.getters.activeTab?.content ?? '',
            set: editor.actions.setContent
        });

        return { content };
    }
});
</script>

<style lang="sass" scoped>
.editor-textarea
    width: 100%
    flex-grow: 1
</style>
