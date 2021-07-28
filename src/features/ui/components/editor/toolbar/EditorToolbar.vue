<template>
    <div
        class="has-background-white has-border-bottom-1-dark p-1 is-flex is-align-center is-justify-content-space-between"
    >
        <div class="is-flex is-align-center">
            <div class="buttons has-addons mb-0 mx-1">
                <IconButton
                    id="editButton"
                    icon="fa-edit"
                    class="p-3"
                    size="is-size-6"
                    v-show="mode != 'split'"
                    @click="toggleMode"
                    v-shortcut:editorToggleMode="toggleMode"
                />

                <IconButton
                    id="saveButton"
                    icon="fa-save"
                    class="p-3"
                    size="is-size-6"
                    v-show="mode !== 'readonly'"
                    @click="() => saveTab(note.id)"
                    v-shortcut:editorSave="() => saveTab(note.id)"
                />
            </div>

            <div class="buttons has-addons mb-0 mx-1">
                <EditorToolbarNotebooksDropdown />

                <EditorToolbarTagsDropdown />

                <IconButton
                    id="favoriteButton"
                    :title="note.favorited ? 'Remove note from favorites' : 'Add note to favorites'"
                    icon="fa-star"
                    size="is-size-6"
                    :class="['has-text-hover-warning', 'p-3', { 'has-text-warning': note.favorited }]"
                    @click="onFavoriteClick"
                />
            </div>
        </div>

        <div>
            <IconButton
                id="deleteButton"
                title="Delete"
                icon="fa-trash"
                size="is-size-6"
                class="p-3 has-text-hover-danger"
                @click="deleteActiveNote"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { store } from '@/store';
import EditorToolbarTagsDropdown from '@/features/ui/components/editor/toolbar/EditorToolbarTagsDropdown.vue';
import EditorToolbarNotebooksDropdown from '@/features/ui/components/editor/toolbar/EditorToolbarNotebooksDropdown.vue';
import { computed, defineComponent } from 'vue';
import { mapActions, mapGetters, mapMutations, useStore } from 'vuex';
import { Note } from '@/features/notes/common/note';
import { useEditor } from '@/features/ui/store/modules/editor';
import { useNotes } from '@/features/notes/store';
import IconButton from '@/components/IconButton.vue';

export default defineComponent({
    setup: function() {
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
            deleteActiveNote: editor.actions.deleteActiveNote,
            toggleMode: editor.actions.toggleMode,
            saveTab: editor.actions.saveTab
        };
    },
    components: {
        EditorToolbarNotebooksDropdown,
        EditorToolbarTagsDropdown,
        IconButton
    }
});
</script>
