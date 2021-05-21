<template>
    <Dropdown>
        <template #trigger="{toggle}">
            <button @click="toggle" class="button mb-0 has-text-hover-grey" title="Tags" style="height: 30px">
                <span class="icon is-small">
                    <i class="fas fa-tag"></i>
                </span>
            </button>
        </template>

        <template #content>
            <TagInput
                :values="tags"
                :selected="tagsForNote(note)"
                @update:selected="onTagInput"
                ref="tagInput"
                placeholder="Type to add tag"
            />
        </template>
    </Dropdown>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import _ from 'lodash';
import Dropdown from '@/components/core/Dropdown.vue';
import TagInput from '@/components/core/form/TagInput.vue';
import { mapGetters, mapState, useStore } from 'vuex';
import { Tag } from '@/store/modules/tags/state';
import { Note } from '@/store/modules/notes/state';

export default defineComponent({
    setup: function() {
        const s = useStore(); // Need this to be able to unit test

        const onTagInput = (newTags: Tag[]) => {
            const note: Note = s.getters['app/editor/activeNote'];
            const oldTags: Tag[] = s.getters['tags/tagsForNote'](note);

            const delta = oldTags.length - newTags.length;
            let tag: Tag;

            switch (delta) {
                case 1:
                    tag = _.differenceWith(oldTags, newTags, (a: Tag, b: Tag) => a.id === b.id)[0];
                    s.commit('notes/REMOVE_TAG', { noteId: note.id, tagId: tag.id });
                    break;

                case -1:
                    tag = _.differenceWith(newTags, oldTags, (a: Tag, b: Tag) => a.id === b.id)[0];
                    s.commit('notes/ADD_TAG', { noteId: note.id, tagId: tag.id });
                    break;
            }
        };

        return {
            onTagInput
        };
    },
    computed: {
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
