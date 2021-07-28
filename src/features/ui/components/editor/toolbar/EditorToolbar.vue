<template>
    <div class="has-background-white has-border-bottom-1-dark p-1 is-flex is-align-center">
        <div class="buttons has-addons mb-0 mx-1">
            <IconButton
                icon="fa-edit"
                id="editButton"
                class="is-size-7 p-3"
                @click="toggleMode"
                v-shortcut:editorToggleMode="toggleMode"
                v-show="mode != 'split'"
            />

            <button
                id="saveButton"
                class="button mb-0"
                style="height: 30px"
                @click="() => saveTab(note.id)"
                v-shortcut:editorSave="() => saveTab(note.id)"
                v-show="mode !== 'readonly'"
            >
                <span class="icon is-small">
                    <i class="fas fa-save"></i>
                </span>
            </button>
            <button
                class="button mb-0 has-text-hover-danger"
                style="height: 30px"
                title="Delete"
                @click="deleteActiveNote"
            >
                <span class="icon is-small">
                    <i class="fas fa-trash"></i>
                </span>
            </button>
        </div>

        <div class="buttons has-addons mb-0 mx-1">
            <EditorToolbarNotebooksDropdown />

            <EditorToolbarTagsDropdown />

            <button
                :class="
                    `button mb-0 has-text-hover-warning ${note != null && note.favorited ? 'has-text-warning' : ''}`
                "
                title="Add to favorites"
                style="height: 30px"
                @click="onFavoriteClick"
            >
                <span class="icon is-small">
                    <i class="fas fa-star"></i>
                </span>
            </button>
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
