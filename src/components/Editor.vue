<template>
    <div id="editor" class="has-background-light is-flex-grow-1 is-flex is-flex-column has-text-dark">
        {{ focused }}
        <template v-if="!isEmpty">
            <editor-tabs />
            <editor-toolbar />

            <div class="is-flex is-flex-row is-flex-grow-1">
                <markdown-editor v-if="mode === 'edit' || mode === 'split'" class="is-flex-basis-0 is-flex-grow-1" />
                <markdown-renderer v-if="mode !== 'edit'" class="is-flex-basis-0 is-flex-grow-1" />
            </div>
        </template>
        <div v-else class="is-flex is-align-center is-justify-center is-flex-grow-1 is-flex-column has-w-100">
            <div>
                There's nothing here!
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import EditorTabs from "@/components/EditorTabs.vue";
import EditorToolbar from "@/components/EditorToolbar.vue";
import MarkdownEditor from "@/components/MarkdownEditor.vue";
import MarkdownRenderer from "@/components/MarkdownRenderer.vue";
import { useEditor } from "@/store/modules/ui/modules/editor";
import { contexts } from "@/utils";

export default defineComponent({
  setup: () => {
    const editor = useEditor();

    // shortcuts.subscribe("focusEditor", () => {
    //   inputScopes.focus({ name: "editor" });
    // });

    return {
      isEmpty: computed(() => editor.getters.isEmpty),
      activeTab: computed(() => editor.getters.activeTab),
      mode: computed(() => editor.state.mode),
      isFocus: computed(() => editor.state.isFocus),
      focused: contexts.active
    };
  },
  components: {
    EditorToolbar,
    EditorTabs,
    MarkdownEditor,
    MarkdownRenderer
  }
});
</script>

<style lang="sass" scoped>
textarea
    outline: none!important
    border: none!important
    resize: none!important
</style>
