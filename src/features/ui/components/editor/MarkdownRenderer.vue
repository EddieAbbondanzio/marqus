<template>
    <div class="content p-3" v-html="content"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import marked from 'marked';
import { mapMutations, useStore } from 'vuex';
import { useEditor } from '@/features/ui/store/modules/editor';

export default defineComponent({
    setup: () => {
        const editor = useEditor();
        const content = marked(editor.getters.activeTab?.content ?? '');

        return { content };
    }
});
</script>
