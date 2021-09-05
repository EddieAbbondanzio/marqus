<template>
    <EditorToolbarDropdown icon="fa-tag" v-model:active="active">
        <template #dropdown>
            <ListBuilder
                :selected="selectedTags"
                @add="onAdd"
                @remove="onRemove"
                v-input-scope:tagListBuilder.hidden="{ querySelector: 'input' }"
            >
                <template #item="{item}">
                    {{ item.value }}
                </template>

                <template #input="{ add }">
                    <Form
                        v-slot="{ meta }"
                        @submit="onSubmit(add)"
                        class="is-flex is-flex-column is-justify-center is-relative"
                    >
                        <InputField label="Tag" :hideLabel="true" v-model="input" v-slot="{ field }" :rules="rules">
                            <Autocomplete
                                placeholder="Type to add tag"
                                :modelValue="field.value"
                                @update:modelValue="field['onUpdate:modelValue']"
                                :values="unusedValues"
                                @select="(tag) => onSubmit(add, tag)"
                            >
                                <template #empty>
                                    <div class="m-2 is-flex is-align-items-center is-justify-content-center">
                                        <span class="is-size-7"
                                            >Tags are a great way to organize your notes into categories or themes</span
                                        >
                                    </div>
                                </template>

                                <template #dropdown v-if="meta.dirty && !meta.valid">
                                    <ErrorMessage name="Tag" v-slot="{ message }">
                                        <div
                                            id="errorMessage"
                                            class="notification is-danger p-1 mt-1 is-flex is-align-center"
                                        >
                                            <span class="icon is-small">
                                                <i class="fas fa-exclamation"></i>
                                            </span>

                                            <span class="is-size-7 pr-2"> {{ message }} </span>
                                        </div>
                                    </ErrorMessage>
                                </template>
                            </Autocomplete>
                        </InputField>
                    </Form>
                </template>
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
import { useTagValidation } from '@/features/tags/hooks/use-tag-validation';
import { generateId } from '@/store';
import { ErrorMessage, Form } from 'vee-validate';
import InputField from '@/components/input/InputField.vue';
import Autocomplete from '@/components/input/auto-complete/Autocomplete.vue';
import { isBlank } from '@/shared/utils';
import { inputScopes } from '@/directives/input-scope/input-scopes';

export default defineComponent({
    setup: function(p, c) {
        const editor = useEditor();
        const tags = useTags();
        const notes = useNotes();

        const note = computed(() => editor.getters.activeNote!);
        const selectedTags = computed(() => tags.getters.tagsForNote(note.value));

        const input = ref('');

        const unusedValues = computed(() => {
            const unused = tags.state.values.filter((v: any) => !selectedTags.value.some((s: any) => s.id === v.id));

            // Add the create option as needed
            if (
                !isBlank(input.value) &&
                !tags.state.values.some((t) => t.value.toLowerCase() === input.value.toLowerCase())
            ) {
                unused.push({
                    id: '',
                    value: `Create new tag '${input.value}'`
                });
            }

            return unused;
        });

        const onSubmit = (add: (v: any) => void, tag?: Tag) => {
            // Handle easy case of clicking a pre-existing tag
            if (tag != null) {
                add(tag);
                return;
            }

            // Stop if we already have it selected. Prevents duplicates
            if (selectedTags.value.some((v: any) => v.value === input.value)) {
                return;
            }

            // Determine if it's a create, or add existing.
            const existing: any = unusedValues.value.find(
                (v: any) => v.value.toLowerCase() === input.value.toLowerCase()
            );

            if (existing != null) {
                add(existing);
            } else {
                const tag = {
                    id: generateId(),
                    value: input.value
                };

                editor.actions.createTag(tag);
                add(tag);
            }

            input.value = '';
        };

        const active = computed({
            get: () => editor.getters.activeTab?.tagDropdownVisible ?? false,
            set: (v) => {
                editor.actions.setTagsDropdownVisible(v);
                inputScopes.focus({ name: 'tagListBuilder' });
            }
        });

        const onAdd = (t: Tag) => notes.dispatch('addTag', { noteId: note.value.id, tagId: t.id });
        const onRemove = (t: Tag) => notes.dispatch('removeTag', { noteId: note.value.id, tagId: t.id });

        const { unique, ...rules } = useTagValidation();

        return {
            input,
            unusedValues,
            onAdd,
            onRemove,
            onSubmit,
            active,
            selectedTags,
            tags: computed(() => tags.state.values),
            note: computed(() => editor.getters.activeNote),
            tagsForNote: computed(() => tags.getters.tagsForNote),
            rules
        };
    },
    components: {
        EditorToolbarDropdown,
        ListBuilder,
        InputField,
        Form,
        ErrorMessage,
        Autocomplete
    }
});
</script>
