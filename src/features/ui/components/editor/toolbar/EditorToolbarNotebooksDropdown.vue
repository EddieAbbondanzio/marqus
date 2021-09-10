<template>
    <EditorToolbarDropdown icon="fa-book" v-model:active="active">
        <template #dropdown>
            <ListBuilder
                :selected="selectedNotebooks"
                @add="onAdd"
                @remove="onRemove"
                v-input-scope:notebookListBuilder.hidden="{ querySelector: 'input' }"
            >
                <template #item="{item}">
                    <p :title="fullyQualify(item)">{{ item.value }}</p>
                </template>

                <template #input="{ add }">
                    <Form
                        v-slot="{ meta }"
                        @submit="onSubmit(add)"
                        class="is-flex is-flex-column is-justify-center is-relative"
                    >
                        <InputField
                            label="Notebook"
                            :hideLabel="true"
                            v-model="input"
                            v-slot="{ field }"
                            :rules="rules"
                        >
                            <Autocomplete
                                placeholder="Type to add notebook"
                                :modelValue="field.value"
                                @update:modelValue="field['onUpdate:modelValue']"
                                :values="unusedValues"
                                @select="(notebook) => onSubmit(add, notebook)"
                            >
                                <template #empty>
                                    <div class="m-2 is-flex is-align-items-center is-justify-content-center">
                                        <span class="is-size-7">Notebooks can be used to group notes together</span>
                                    </div>
                                </template>

                                <template #dropdown v-if="meta.dirty && !meta.valid">
                                    <ErrorMessage name="Notebook" v-slot="{ message }">
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
import { computed, defineComponent, ref } from 'vue';
import { Notebook, fullyQualify } from '@/features/notebooks/shared/notebook';
import { useEditor } from '@/features/ui/store/modules/editor';
import { useNotebooks } from '@/features/notebooks/store';
import { useNotes } from '@/features/notes/store';
import EditorToolbarDropdown from '@/features/ui/components/editor/toolbar/EditorToolbarDropdown.vue';
import ListBuilder from '@/components/input/ListBuilder.vue';
import Autocomplete from '@/components/input/auto-complete/Autocomplete.vue';
import { ErrorMessage, Form } from 'vee-validate';
import InputField from '@/components/input/InputField.vue';
import { generateId } from '@/store';
import { isBlank } from '@/shared/utils';
import { useNotebookValidation } from '@/features/notebooks/hooks/use-notebook-validation';
import { inputScopes } from '@/directives/input-scope/input-scopes';

export default defineComponent({
    setup() {
        const editor = useEditor();
        const notebooks = useNotebooks();
        const notes = useNotes();

        const note = computed(() => editor.getters.activeNote!);
        const selectedNotebooks = computed(() => notebooks.getters.notebooksForNote(note.value));

        const input = ref('');

        const unusedValues = computed(() => {
            const unused = notebooks.getters.flatten.filter(
                (v: any) => !selectedNotebooks.value.some((s: any) => s.id === v.id)
            );

            // Add the create option as needed
            if (
                !isBlank(input.value) &&
                !notebooks.state.values.some((n) => n.name.toLowerCase() === input.value.toLowerCase())
            ) {
                unused.push({
                    id: '',
                    name: `Create new notebook '${input.value}'`
                });
            }

            return unused;
        });

        const onSubmit = (add: (v: any) => void, notebook?: Notebook) => {
            // Handle easy case of clicking a pre-existing notebook
            if (notebook != null) {
                add(notebook);
                return;
            }

            // Stop if we already have it selected. Prevents duplicates
            if (selectedNotebooks.value.some((v: any) => v.value === input.value)) {
                return;
            }

            // Determine if it's a create, or add existing.
            const existing: any = unusedValues.value.find(
                (v: any) => v.value.toLowerCase() === input.value.toLowerCase()
            );

            if (existing != null) {
                add(existing);
            } else {
                const notebook = {
                    id: generateId(),
                    name: input.value
                };

                editor.actions.createNotebook(notebook);
                add(notebook);
            }

            input.value = '';
        };

        const active = computed({
            get: () => editor.getters.activeTab?.notebookDropdownVisible ?? false,
            set: (v) => {
                editor.actions.setNotebooksDropdownVisible(v);
                inputScopes.focus({ name: 'notebookListBuilder' });
            }
        });

        const onAdd = (n: Notebook) => notes.dispatch('addNotebook', { note: note.value, notebookId: n.id });
        const onRemove = (n: Notebook) => notes.dispatch('removeNotebook', { note: note.value, notebookId: n.id });

        const { unique, ...rules } = useNotebookValidation();

        return {
            input,
            unusedValues,
            onAdd,
            onRemove,
            onSubmit,
            active,
            selectedNotebooks,
            notebooks: computed(() => notebooks.state.values),
            note: computed(() => editor.getters.activeNote),
            notebooksForNote: computed(() => notebooks.getters.notebooksForNote),
            rules,
            fullyQualify
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
