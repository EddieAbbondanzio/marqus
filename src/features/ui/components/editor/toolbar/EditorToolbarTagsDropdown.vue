<template>
    <EditorToolbarDropdown icon="fa-tag" v-model:active="active">
        <template #dropdown>
            <ListBuilder
                :values="tags"
                :selected="selectedTags"
                :rules="rules"
                inputName="tag"
                inputPlaceholder="Type to add tag"
                @create="onCreate"
                @update:selected="onUpdate"
                v-focusable:tagListBuilder.hidden="{ querySelector: 'input' }"
            />
        </template>
    </EditorToolbarDropdown>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, onRenderTriggered, ref, watch } from 'vue';
import _ from 'lodash';
import { Tag } from '@/features/tags/common/tag';
import { useEditor } from '@/features/ui/store/modules/editor';
import { useTags } from '@/features/tags/store';
import { useNotes } from '@/features/notes/store';
import EditorToolbarDropdown from '@/features/ui/components/editor/toolbar/EditorToolbarDropdown.vue';
import ListBuilder from '@/components/input/ListBuilder.vue';
import { focusManager } from '@/directives/focusable';
import { useTagValidation } from '@/features/tags/hooks/use-tag-validation';

export default defineComponent({
    setup: function(p, c) {
        const editor = useEditor();
        const tags = useTags();
        const notes = useNotes();
        const note = computed(() => editor.getters.activeNote!);

        const onUpdate = (newTags: Tag[]) => {
            const oldTags = tags.getters.tagsForNote(note.value);

            const delta = oldTags.length - newTags.length;
            let tag: Tag;

            switch (delta) {
                case 1:
                    [tag] = _.differenceWith(oldTags, newTags, (a, b) => a.id === b.id);
                    notes.actions.removeTag({ noteId: note.value.id, tagId: tag.id });
                    break;

                case -1:
                    [tag] = _.differenceWith(newTags, oldTags, (a, b) => a.id === b.id);
                    notes.actions.addTag({ noteId: note.value.id, tagId: tag.id });
                    break;
            }
        };

        const active = computed({
            get: () => editor.getters.activeTab?.tagDropdownVisible ?? false,
            set: (v) => {
                editor.actions.setTagsDropdownVisible(v);
                focusManager.focus('tagListBuilder');
            }
        });

        const tagInput = ref(null) as any;

        const onToggle = () => {
            tagInput.value.focus();
        };

        // Allow user to create new tags from the droopdown.
        const onCreate = (name: string) => {
            editor.dispatch('createTag', name);

            // After creating it, add it to the active note
            nextTick(() => {
                const newTag = tags.getters.byName(name, { required: true });
                notes.actions.addTag({ noteId: note.value.id, tagId: newTag.id });
            });
        };

        const selectedTags = computed(() => tags.getters.tagsForNote(note.value));

        const rules = useTagValidation();

        const onListBuilderBlur = (e: any) => {
            active.value = false;
        };

        return {
            onListBuilderBlur,
            onCreate,
            active,
            onUpdate,
            onToggle,
            tagInput,
            selectedTags,
            tags: computed(() => tags.state.values),
            note: computed(() => editor.getters.activeNote),
            tagsForNote: computed(() => tags.getters.tagsForNote),
            rules
        };
    },
    components: {
        EditorToolbarDropdown,
        ListBuilder
    }
});
</script>
