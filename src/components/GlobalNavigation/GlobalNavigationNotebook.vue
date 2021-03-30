<template>
    <Collapse v-if="modelValue.children" v-model="expanded" triggerClass="has-background-hover-light">
        <template #trigger>
            <div class="is-flex-grow-1 has-background-transparent">
                <GlobalNavigationNotebookForm
                    v-if="isNotebookBeingUpdated(modelValue.id)"
                    @submit="confirmUpdate"
                    @cancel="cancelUpdate"
                />
                <a v-else class="has-text-grey" @click="() => (active = modelValue.id)">
                    <p
                        :class="[
                            'global-navigation-notebook',
                            'global-navigation-item',
                            { 'has-background-light': active == modelValue.id }
                        ]"
                        :data-id="modelValue.id"
                        :style="`padding-left: ${depth * 24}px`"
                    >
                        {{ modelValue.value }}
                    </p>
                </a>
            </div>
        </template>

        <ul class="is-size-7" v-for="child in modelValue.children" :key="child.id">
            <GlobalNavigationNotebook :modelValue="child" :depth="depth + 1" />
        </ul>
    </Collapse>
    <li v-else class="is-flex-grow-1" :class="{ 'has-background-light': active == modelValue.id }">
        <GlobalNavigationNotebookForm
            v-if="isNotebookBeingUpdated(modelValue.id)"
            @submit="confirmUpdate"
            @cancel="cancelUpdate"
        />
        <a v-else class="has-text-grey" @click="() => (active = modelValue.id)">
            <p
                class="global-navigation-notebook global-navigation-item has-background-hover-light"
                :style="`padding-left: ${depth * 24}px`"
                :data-id="modelValue.id"
            >
                {{ modelValue.value }}
            </p>
        </a>
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
        modelValue: Object,
        depth: {
            type: Number,
            default: 1
        }
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

        const active = computed({
            get: () => s.state.editor.globalNavigation.active,
            set: (v: any) => s.commit('editor/UPDATE_STATE', { key: 'globalNavigation.active', value: v })
        });

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
            notebookInputMode,
            active
        };
    },
    components: { Collapse, GlobalNavigationNotebookForm }
});
</script>
