<template>
    <div class="content p-3" v-html="content"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import marked from 'marked';
import { useEditor } from '@/store/modules/ui/modules/editor';

export default defineComponent({
    setup: () => {
        const editor = useEditor();
        const content = marked(editor.getters.activeTab?.content ?? '');

        return { content };
    }
});
</script>
