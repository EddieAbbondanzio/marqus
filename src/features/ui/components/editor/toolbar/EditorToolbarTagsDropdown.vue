<template>
    <EditorToolbarDropdown icon="fa-tag" v-model:active="active">
        <template #dropdown>
            <ListBuilder
                :values="tags"
                :selected="selectedTags"
                :rules="rules"
                inputName="tag"
                inputPlaceholder="Type to add tag"
                :createFactory="tagFactory"
                @add="onAdd"
                @remove="onRemove"
                v-focusable:tagListBuilder.hidden="{ querySelector: 'input' }"
            >
            </ListBuilder>
        </template>
    </EditorToolbarDropdown>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, onRenderTriggered, ref, watch } from 'vue';
import { Tag } from '@/features/tags/common/tag';
import { useEditor } from '@/features/ui/store/modules/editor';
import { useTags } from '@/features/tags/store';
import { useNotes } from '@/features/notes/store';
import EditorToolbarDropdown from '@/features/ui/components/editor/toolbar/EditorToolbarDropdown.vue';
import ListBuilder from '@/components/input/ListBuilder.vue';
import { focusManager } from '@/directives/focusable';
import { useTagValidation } from '@/features/tags/hooks/use-tag-validation';
import { generateId } from '@/store';

export default defineComponent({
    setup: function(p, c) {
        const editor = useEditor();
        const tags = useTags();
        const notes = useNotes();

        const note = computed(() => editor.getters.activeNote!);
        const selectedTags = computed(() => tags.getters.tagsForNote(note.value));

        const active = computed({
            get: () => editor.getters.activeTab?.tagDropdownVisible ?? false,
            set: (v) => {
                editor.actions.setTagsDropdownVisible(v);
                focusManager.focus('tagListBuilder');
            }
        });

        const tagInput = ref(null) as any;

        const tagFactory = (value: string) => {
            const tag = {
                id: generateId(),
                value
            };

            editor.dispatch('createTag', tag);
            console.log('tag factory called!');

            return tag;
        };

        const onAdd = (t: Tag) => notes.dispatch('addTag', { noteId: note.value.id, tagId: t.id });
        const onRemove = (t: Tag) => notes.dispatch('removeTag', { noteId: note.value.id, tagId: t.id });

        const { unique, ...rules } = useTagValidation();

        const onListBuilderBlur = (e: any) => {
            active.value = false;
        };

        return {
            onListBuilderBlur,
            tagFactory,
            onAdd,
            onRemove,
            active,
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
