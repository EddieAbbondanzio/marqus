<template>
    <li class="m-1 has-text-grey is-size-7">
        input: {{ input.id }}

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
                    <GlobalNavigationNotebookForm
                        v-if="notebookInputMode === 'create'"
                        @submit="confirmCreate"
                        @cancel="cancelCreate"
                    />
                </li>
                <li class=" mb-1" v-for="notebook in notebooks" :key="notebook.id">
                    <global-navigation-notebook :modelValue="notebook" />
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
import GlobalNavigationNotebook from '@/components/GlobalNavigation/GlobalNavigationNotebook.vue';
import GlobalNavigationNotebookForm from '@/components/GlobalNavigation/GlobalNavigationNotebookForm.vue';

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

        const notebookInputMode = computed(() => s.state.editor.globalNavigation.notebooks.input.mode);

        return {
            expanded,
            notebooks,
            unique,
            confirmCreate,
            cancelCreate,
            input,
            inputValue,
            notebookInputMode
        };
    },
    components: { Collapse, GlobalNavigationNotebook, GlobalNavigationNotebookForm }
});
</script>
