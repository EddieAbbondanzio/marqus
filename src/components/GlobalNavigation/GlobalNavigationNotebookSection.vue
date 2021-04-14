<template>
    <li class="has-text-grey is-size-7">
        <collapse v-model="expanded" triggerClass="has-background-hover-light">
            <template #trigger>
                <div class="is-flex is-align-center has-background-transparent global-navigation-title">
                    <span class="icon">
                        <i class="fas fa-book"></i>
                    </span>
                    <span class="is-size-7 is-uppercase">Notebooks</span>
                </div>
            </template>

            <ul class="is-size-7">
                <li>
                    <GlobalNavigationNotebookForm
                        v-if="notebookInputMode === 'create'"
                        @submit="confirmCreate"
                        @cancel="cancelCreate"
                    />
                </li>
                <li v-for="notebook in notebooks" :key="notebook.id">
                    <GlobalNavigationNotebook :modelValue="notebook" />
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
            get: () => s.state.app.globalNavigation.notebooks.expanded,
            set: (v: any) => {
                s.commit('app/globalNavigation/NOTEBOOKS_EXPANDED', v);
                s.commit('DIRTY', null, { root: true });
            }
        });

        const notebooks = computed(() => s.state.app.globalNavigation.notebooks.entries);

        // OLD below here

        const input = computed(() => s.state.app.globalNavigation.notebooks.input);

        const inputValue = computed({
            get: () => s.state.app.globalNavigation.notebooks.input?.value,
            set: (v: string) =>
                s.commit('app/UPDATE_STATE', { key: 'globalNavigation.notebooks.input.value', value: v })
        });

        const confirmCreate = () => s.dispatch('app/createNotebookConfirm');
        const cancelCreate = () => s.dispatch('app/createNotebookCancel');

        const notebookInputMode = computed(() => s.state.app.globalNavigation.notebooks.input.mode);

        return {
            expanded,
            notebooks,
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
