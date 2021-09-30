<template>
    <div
        class="has-background-white has-border-bottom-1-dark p-1 is-flex is-align-center
         is-justify-content-space-between editor-toolbar"
    >
        <div class="is-flex is-align-center">
            <div class="mb-0 ">
                <IconButton
                    id="editButton"
                    class="px-3 py-0"
                    icon="fa-edit"
                    size="is-size-6"
                    @click="toggleMode"
                />
                <IconButton
                    id="saveButton"
                    class="px-3 py-0"
                    :disabled="mode !== 'edit'"
                    icon="fa-save"
                    size="is-size-6"
                    @click="() => saveTab(note.id)"
                />
            </div>

            <div class="mb-0">
                <EditorToolbarNotebooksDropdown />

                <EditorToolbarTagsDropdown />

                <IconButton
                    id="favoriteButton"
                    class="px-3 py-0"
                    :title="isFavorited ? 'Remove note from favorites' : 'Add note to favorites'"
                    icon="fa-star"
                    size="is-size-6"
                    :class="['has-text-hover-warning', { 'has-text-warning': isFavorited }]"
                    @click="onFavoriteClick"
                />
            </div>
        </div>

        <div>
            <IconButton
                id="deleteButton"
                class="px-3 py-0 has-text-hover-danger"
                title="Delete"
                icon="fa-trash"
                size="is-size-6"
                @click="deleteActiveNote"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { store } from "@/store";
import EditorToolbarTagsDropdown from "@/components/EditorToolbarTagsDropdown.vue";
import EditorToolbarNotebooksDropdown from "@/components/EditorToolbarNotebooksDropdown.vue";
import { computed, defineComponent, ref } from "vue";
import { useEditor } from "@/store/modules/ui/modules/editor";
import { useNotes } from "@/store/modules/notes";
import IconButton from "@/components/buttons/IconButton.vue";

export default defineComponent({
  setup: function () {
    const editor = useEditor();
    const notes = useNotes();

    const onFavoriteClick = () => {
      const note = editor.getters.activeNote;

      if (note == null) {
        return;
      }

      notes.actions.toggleFavorite(note);
    };

    return {
      onFavoriteClick,
      mode: computed(() => editor.state.mode),
      note: computed(() => editor.getters.activeNote),
      isFavorited: computed(() => editor.getters.activeNote?.favorited ?? false),
      deleteActiveNote: editor.actions.deleteActiveNote,
      toggleMode: editor.actions.toggleMode,
      saveTab: editor.actions.saveTab,
      test: ref(false)
    };
  },
  components: {
    EditorToolbarNotebooksDropdown,
    EditorToolbarTagsDropdown,
    IconButton
  }
});
</script>

<style lang="sass">
.editor-toolbar
    button
        height: 30px!important
</style>
