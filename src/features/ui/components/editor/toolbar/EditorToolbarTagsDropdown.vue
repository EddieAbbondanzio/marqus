<template>
    <EditorToolbarDropdown icon="fa-tag">
        <template #dropdown>
            <ListBuilder :available="tags" :selected="[]" />
        </template>
    </EditorToolbarDropdown>

    <Dropdown v-model:active="active">
        <template #trigger="{toggle}">
            <button
                @click="
                    (e) => {
                        toggle(e);
                        onToggle();
                    }
                "
                class="button mb-0 has-text-hover-grey"
                title="Tags"
                style="height: 30px"
            >
                <span class="icon is-small">
                    <i class="fas fa-tag"></i>
                </span>
            </button>
        </template>

        <template #menu>
            <div class="dropdown-menu p-0">
                <div class="dropdown-content p-0">
                    <TagInput
                        :values="tags"
                        :selected="tagsForNote(note)"
                        @update:selected="onTagInput"
                        @blur="() => (active = false)"
                        ref="tagInput"
                        placeholder="Type to add tag"
                    />
                </div>
            </div>
        </template>
    </Dropdown>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import _ from 'lodash';
import Dropdown from '@/components/Dropdown.vue';
import TagInput from '@/components/input/TagInput.vue';
import { mapGetters, mapState, useStore } from 'vuex';
import { Note } from '@/features/notes/common/note';
import { Tag } from '@/features/tags/common/tag';
import { Tab } from '@/features/ui/store/modules/editor/state';
import { useEditor } from '@/features/ui/store/modules/editor';
import { useTags } from '@/features/tags/store';
import { useNotes } from '@/features/notes/store';
import EditorToolbarDropdown from '@/features/ui/components/editor/toolbar/EditorToolbarDropdown.vue';
import ListBuilder from '@/components/input/ListBuilder.vue';

export default defineComponent({
    setup: function() {
        const editor = useEditor();
        const tags = useTags();
        const notes = useNotes();

        const onTagInput = (newTags: Tag[]) => {
            const note = editor.getters.activeNote!;
            const oldTags = tags.getters.tagsForNote(note);

            const delta = oldTags.length - newTags.length;
            let tag: Tag;

            switch (delta) {
                case 1:
                    [tag] = _.differenceWith(oldTags, newTags, (a, b) => a.id === b.id);
                    notes.actions.removeTag({ noteId: note.id, tagId: tag.id });
                    break;

                case -1:
                    [tag] = _.differenceWith(newTags, oldTags, (a, b) => a.id === b.id);
                    notes.actions.addTag({ noteId: note.id, tagId: tag.id });
                    break;
            }
        };

        const active = computed({
            get: () => editor.getters.activeTab?.tagDropdownVisible ?? false,
            set: editor.actions.setTagsDropdownVisible
        });

        const tagInput = ref(null) as any;

        const onToggle = () => {
            tagInput.value.focus();
        };

        return {
            active,
            onTagInput,
            onToggle,
            tagInput,
            tags: computed(() => tags.state.values),
            note: computed(() => editor.getters.activeNote),
            tagsForNote: computed(() => tags.getters.tagsForNote)
        };
    },
    components: {
        Dropdown,
        TagInput,
        EditorToolbarDropdown,
        ListBuilder
    }
});
</script>
