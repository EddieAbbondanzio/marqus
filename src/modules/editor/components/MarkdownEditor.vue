<template>
    <textarea class="editor-textarea p-3" :value="content" @input="onInput"></textarea>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
    setup: () => {
        const s = useStore();

        let id = s.state.app.editor.tabs.active;
        const content = ref('');
        content.value = s.state.app.editor.tabs.values.find((t: any) => t.id === id).content;

        watch(
            () => s.state.app.editor.tabs.active,
            () => {
                id = s.state.app.editor.tabs.active;
                content.value = s.state.app.editor.tabs.values.find((t: any) => t.id === id).content;
            }
        );

        const onInput = (e: InputEvent) => {
            s.commit('app/editor/TAB_CONTENT', { tab: id, content: (e.target as HTMLTextAreaElement).value });
        };

        return { content, onInput };
    }
});
</script>

<style lang="sass" scoped>
.editor-textarea
    width: 100%
    flex-grow: 1
</style>
