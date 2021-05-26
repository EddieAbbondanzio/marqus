<template>
    <div class="has-background-white has-border-bottom-1-dark p-1 is-flex is-align-center">
        <div class="buttons has-addons mb-0 mx-1">
            <button
                id="editButton"
                :class="editButtonClasses"
                style="height: 30px"
                @click="toggleMode"
                v-shortcut:editorToggleMode="toggleMode"
                v-if="mode != 'split'"
            >
                <span v-if="mode !== 'split'" :class="`icon is-small ${mode === 'edit' ? 'has-text-warning' : ''}`">
                    <i class="fas fa-edit"></i>
                </span>
                <span v-else class="icon is-small">
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
import EditorToolbarTagsDropdown from '@/components/editor/toolbar/EditorToolbarTagsDropdown.vue';
import EditorToolbarNotebooksDropdown from '@/components/editor/toolbar/EditorToolbarNotebooksDropdown.vue';
import { defineComponent } from 'vue';
import { mapActions, mapGetters, useStore } from 'vuex';
import { Note } from '@/store/modules/notes/state';
import { EditorMode } from '@/store/modules/app/modules/editor/state';

export default defineComponent({
    setup: function() {
        const s = useStore();

        const onFavoriteClick = () => {
            const note: Note = s.getters['app/editor/activeNote'];
            s.dispatch('notes/toggleFavorite', note);
        };

        const test = () => {
            console.log('FUCK');
        };

        return {
            test,
            onFavoriteClick
        };
    },
    computed: {
        mode: () => (store.state.app.editor as any).mode,
        editButtonClasses: () => ({
            'button mb-0': true
        }),
        ...mapGetters('app/editor', {
            note: 'activeNote'
        })
    },
    methods: {
        ...mapActions('app/editor', ['deleteActiveNote', 'toggleMode'])
    },
    components: {
        EditorToolbarNotebooksDropdown,
        EditorToolbarTagsDropdown
    }
});
</script>
