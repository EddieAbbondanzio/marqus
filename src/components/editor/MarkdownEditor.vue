<template>
    <textarea class="editor-textarea" v-model="v"></textarea>
</template>

<script lang="ts">
import { Tab } from '@/store/modules/app/modules/editor/state';
import { computed, defineComponent, ref, watch } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
    setup: () => {
        const s = useStore();
        const activeTab: Tab = s.getters['app/editor/activeTab'];

        const v = computed({
            get: () => activeTab.content!,
            set: (v: string) => s.commit('notes/CONTENT', { id: activeTab.noteId, content: v })
        });

        return { v };
    }
});
</script>

<style lang="sass" scoped>
.editor-textarea
    width: 100%
    flex-grow: 1
</style>
