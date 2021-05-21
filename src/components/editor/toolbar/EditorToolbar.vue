<template>
    <div class="has-background-white has-border-bottom-1-dark p-1 is-flex is-align-center">
        <div class="buttons has-addons mb-0 mx-1">
            <button id="editButton" :class="editButtonClasses" style="height: 30px" title="Edit" @click="toggleMode">
                <span class="icon is-small" v-if="mode === 'view'">
                    <i class="fas fa-edit"></i>
                </span>
                <span class="icon is-small" v-else>
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

export default defineComponent({
    setup: function() {
        const s = useStore();

        const onFavoriteClick = () => {
            const note: Note = s.getters['app/editor/activeNote'];

            if (note == null) {
                return;
            }

            if (!note.favorited) {
                s.commit('notes/FAVORITE', note.id);
            } else {
                s.commit('notes/UNFAVORITE', note.id);
            }
        };

        return {
            onFavoriteClick
        };
    },
    computed: {
        mode: () => (store.state.app as any).mode,
        editButtonClasses: () => ({
            'button mb-0': true
        }),
        ...mapGetters('app/editor', {
            note: 'activeNote'
        })
    },
    methods: {
        ...mapActions('app/editor', ['deleteActiveNote'])
    },
    components: {
        EditorToolbarNotebooksDropdown,
        EditorToolbarTagsDropdown
    }
});
</script>
