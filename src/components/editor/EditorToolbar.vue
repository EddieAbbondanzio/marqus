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
            <button class="button mb-0 has-text-hover-danger" style="height: 30px" title="Delete">
                <span class="icon is-small">
                    <i class="fas fa-trash"></i>
                </span>
            </button>
        </div>

        <div class="buttons has-addons mb-0 mx-1">
            <button class="button mb-0 has-text-hover-grey" title="Notebooks" style="height: 30px">
                <span class="icon is-small">
                    <i class="fas fa-book"></i>
                </span>
            </button>

            <Dropdown>
                <template #trigger="{toggle}">
                    <button @click="toggle" class="button mb-0 has-text-hover-grey" title="Tags" style="height: 30px">
                        <span class="icon is-small">
                            <i class="fas fa-tag"></i>
                        </span>
                    </button>
                </template>

                <template #content>
                    <TagInput :values="tags" :selected="tagsForNote(note)" @update:selected="onTagsInput" />
                </template>
            </Dropdown>

            <button class="button mb-0 has-text-hover-warning" title="Add to favorites" style="height: 30px">
                <span class="icon is-small">
                    <i class="fas fa-star"></i>
                </span>
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { store } from '@/store';
import { computed, defineComponent, onMounted, ref } from 'vue';
import { mapGetters, mapMutations, mapState, useStore } from 'vuex';
import Dropdown from '@/components/core/Dropdown.vue';
import TagInput from '@/components/core/form/TagInput.vue';
import { Tag } from '@/store/modules/tags/state';
import { Note } from '@/store/modules/notes/state';
import _ from 'lodash';

export default defineComponent({
    setup: function() {
        const s = useStore(); // Need this to be able to unit test

        const onTagsInput = (newTags: Tag[]) => {
            const activeTab = s.state.app.editor.tabs.values.find((t: any) => t.id === s.state.app.editor.tabs.active);
            const note = s.state.notes.values.find((n: Note) => n.id === activeTab.noteId) as Note;

            const oldTags = s.getters['tags/tagsForNote'](note);

            // Removed tag
            if (oldTags.length > newTags.length) {
                const deletedTag = _.differenceWith(oldTags, newTags, (a: Tag, b: Tag) => a.id === b.id)[0];
                s.commit('notes/REMOVE_TAG', { noteId: note.id, tagId: deletedTag.id });
            }
            // Added tag
            else {
                const addedTag = _.differenceWith(newTags, oldTags, (a: Tag, b: Tag) => a.id === b.id)[0];
                s.commit('notes/ADD_TAG', { noteId: note.id, tagId: addedTag.id });
            }
        };

        return {
            onTagsInput
        };
    },
    computed: {
        mode: () => (store.state.app as any).mode,
        editButtonClasses: () => ({
            'button mb-0': true
        }),
        ...mapState('tags', {
            tags: 'values'
        }),
        ...mapGetters('app/editor', {
            note: 'activeNote'
        }),
        ...mapGetters('tags', ['tagsForNote'])
    },
    components: {
        Dropdown,
        TagInput
    }
});
</script>
