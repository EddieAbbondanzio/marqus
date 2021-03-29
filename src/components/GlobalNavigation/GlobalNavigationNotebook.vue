<template>
    <Collapse v-if="modelValue.children" v-model="expanded">
        <template #trigger>
            <div class="mb-1 is-flex-grow-1">
                <GlobalNavigationNotebookForm
                    v-if="isNotebookBeingUpdated(modelValue.id)"
                    @submit="confirmUpdate"
                    @cancel="cancelUpdate"
                />
                <p v-else class="global-navigation-notebook" :data-id="modelValue.id">{{ modelValue.value }}</p>
            </div>
        </template>

        <ul class="is-size-7" style="margin-left: 24px;" v-for="child in modelValue.children" :key="child.id">
            <GlobalNavigationNotebook :modelValue="child" />
        </ul>
    </Collapse>
    <li v-else class="mb-1 is-flex-grow-1">
        <GlobalNavigationNotebookForm
            v-if="isNotebookBeingUpdated(modelValue.id)"
            @submit="confirmUpdate"
            @cancel="cancelUpdate"
        />
        <p v-else class="global-navigation-notebook" :data-id="modelValue.id">{{ modelValue.value }}</p>
    </li>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import Collapse from '@/components/Collapse.vue';
import { Notebook } from '@/store/modules/editor/state';
import GlobalNavigationNotebookForm from '@/components/GlobalNavigation/GlobalNavigationNotebookForm.vue';
import { useStore } from 'vuex';
import { isBlank } from '@/utils/is-blank';

export default defineComponent({
    props: {
        modelValue: Object
    },
    name: 'GlobalNavigationNotebook',
    setup: function(p, c) {
        const s = useStore();

        const expanded = computed({
            get: () => p.modelValue!.expanded,
            set: (v: any) => s.commit('editor/SET_NOTEBOOK_EXPAND', { id: p.modelValue!.id, value: v })
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

        const isNotebookBeingUpdated = s.getters['editor/isNotebookBeingUpdated'];
        const notebookInputMode = computed(() => s.state.editor.globalNavigation.notebooks.input.mode);

        return {
            expanded,
            notebooks,
            unique,
            confirmCreate,
            cancelCreate,
            confirmUpdate,
            cancelUpdate,
            input,
            isNotebookBeingUpdated,
            inputValue,
            notebookInputMode
        };
    },
    components: { Collapse, GlobalNavigationNotebookForm }
});
</script>
