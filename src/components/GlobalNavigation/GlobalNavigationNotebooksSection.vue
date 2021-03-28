<template>
    <li class="m-1 has-text-grey is-size-7">
        <collapse v-model="expanded">
            <template #trigger>
                <div class="is-flex is-align-center">
                    <span class="icon">
                        <i class="fas fa-book"></i>
                    </span>
                    <span class="is-size-7 is-uppercase">Notebooks</span>
                </div>
            </template>

            <ul class="is-size-7" style="margin-left: 24px;">
                <li class="mb-1">
                    <Form @submit="confirmCreate" v-slot="{ submitForm }" v-if="input.mode === 'create'">
                        <Field name="Notebook" v-model="inputValue" v-slot="{ field }" :rules="uniqueValue">
                            <input type="text" v-bind="field" v-focus @keyup.esc="cancelCreate" />
                            <a href="#" class="mx-1 has-text-grey has-text-hover-success" @click="submitForm">
                                <span class="icon is-small">
                                    <i class="fas fa-check" />
                                </span>
                            </a>
                            <a href="#" class="has-text-grey has-text-hover-danger" @click="cancelCreate">
                                <span class="icon is-small">
                                    <i class="fas fa-ban" />
                                </span>
                            </a>
                        </Field>
                        <ErrorMessage name="Notebook" v-slot="{ message }">
                            <p class="has-text-danger">{{ message }}</p>
                        </ErrorMessage>
                    </Form>
                </li>
                <li class=" mb-1" v-for="notebook in notebooks" :key="notebook.id">
                    <Form
                        v-if="input.mode == 'update' && input.id === notebook.id"
                        @submit="confirmUpdate"
                        v-slot="{ submitForm }"
                    >
                        <Field name="Notebook" v-model="inputValue" v-slot="{ field }" :rules="uniqueValue">
                            <input type="text" v-bind="field" v-focus @keyup.esc="cancelUpdate" />
                            <a href="#" class="mx-1 has-text-grey has-text-hover-success" @click="submitForm">
                                <span class="icon is-small">
                                    <i class="fas fa-check" />
                                </span>
                            </a>
                            <a href="#" class="has-text-grey has-text-hover-danger" @click="cancelUpdate">
                                <span class="icon is-small">
                                    <i class="fas fa-ban" />
                                </span>
                            </a>
                        </Field>
                        <ErrorMessage name="Notebook" v-slot="{ message }">
                            <p class="has-text-danger">{{ message }}</p>
                        </ErrorMessage>
                    </Form>
                    <p v-else class="global-navigation-notebook" :data-id="notebook.id">{{ notebook.value }}</p>
                </li>
            </ul>
        </collapse>
    </li>
</template>

<script lang="ts">
import { isBlank } from '@/utils/is-blank';
import { computed, defineComponent } from 'vue';
import { useStore } from 'vuex';
import { useField, Field, ErrorMessage, Form } from 'vee-validate';
import Collapse from '@/components/Collapse.vue';

export default defineComponent({
    setup: function() {
        const s = useStore();

        const expanded = computed({
            get: () => s.state.editor.globalNavigation.notebooks.expanded,
            set: (v: any) => s.commit('editor/UPDATE_STATE', { key: 'globalNavigation.notebooks.expanded', value: v })
        });

        const notebooks = computed(() => s.state.editor.globalNavigation.notebooks.entries);

        const unique = (v: any) => {
            if (v == null || isBlank(v)) {
                return 'Notebook cannot be empty';
            }

            const existing = s.state.editor.globalNavigation.tags.entries.find(
                (t: any) => t.value.toUpperCase() === v.toUpperCase()
            );
            if (existing != null) {
                return `Notebook with value ${v} already exists`;
            }

            return true;
        };

        const input = computed(() => s.state.editor.globalNavigation.notebooks.input);

        const inputValue = computed({
            get: () => s.state.editor.globalNavigation.notebooks.input?.value,
            set: (v: string) =>
                s.commit('editor/UPDATE_STATE', { key: 'globalNavigation.notebooks.input.value', value: v })
        });

        const confirmCreate = () => s.dispatch('editor/createNotebookConfirm');
        const cancelCreate = () => s.dispatch('editor/createNotebookCancel');
        const confirmUpdate = () => s.dispatch('editor/updateNotebookConfirm');
        const cancelUpdate = () => s.dispatch('editor/updateNotebookCancel');

        return {
            expanded,
            notebooks,
            unique,
            confirmCreate,
            cancelCreate,
            confirmUpdate,
            cancelUpdate,
            input,
            inputValue
        };
    },
    components: { Collapse, Field, ErrorMessage, Form }
});
</script>
