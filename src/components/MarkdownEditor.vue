<template>
    <textarea class="editor-textarea p-3" v-model="content"></textarea>
</template>

<script lang="ts">
import { useEditor } from "@/store/modules/ui/modules/editor";
import { computed, defineComponent, ref, watch } from "vue";

export default defineComponent({
  setup: () => {
    const editor = useEditor();

    const content = computed({
      get: () => editor.getters.activeTab?.content ?? "",
      set: editor.actions.setTabContent
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
