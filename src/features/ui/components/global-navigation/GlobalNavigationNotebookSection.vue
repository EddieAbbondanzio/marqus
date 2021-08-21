<template>
    <NavigationMenuItem
        icon="book"
        label="NOTEBOOKS"
        v-model:expanded="expanded"
        @click="() => setActive({ section: 'notebook' })"
        :title="count"
        :active="isActive({ section: 'notebook' })"
        :highlight="isHighlighted({ section: 'notebook' })"
    >
        <template #options>
            <IconButton
                icon="fa-plus"
                class="has-text-grey  has-text-hover-success"
                size="is-size-7"
                title="Create new notebook"
                @click.prevent.stop="() => createNotebook()"
            />
        </template>

        <NavigationMenuForm
            v-if="isNotebookBeingCreated()"
            @submit="confirm"
            @cancel="cancel"
            v-model="input"
            fieldName="Notebook"
            :rules="formRules"
            indent="24px"
        />
        <GlobalNavigationNotebook v-for="notebook in notebooks" :key="notebook.id" :modelValue="notebook" />
    </NavigationMenuItem>

    <Teleport to="#cursor-dragging" v-if="isNotebookBeingDragged">
        <GlobalNavigationNotebook :modelValue="getNotebookById(dragging)" class="has-background-white" />
    </Teleport>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import GlobalNavigationNotebook from '@/features/ui/components/global-navigation/GlobalNavigationNotebook.vue';
import NavigationMenuForm from '@/components/navigation/NavigationMenuForm.vue';
import NavigationMenuItem from '@/components/navigation/NavigationMenuItem.vue';
import { Notebook } from '@/features/notebooks/common/notebook';
import IconButton from '@/components/buttons/IconButton.vue';
import { useGlobalNavigation } from '@/features/ui/store/modules/global-navigation';
import { useNotebooks } from '@/features/notebooks/store';
import { shortcutManager } from '@/features/shortcuts/directives/shortcut';

export default defineComponent({
    setup: function() {
        const globalNav = useGlobalNavigation();
        const notebooks = useNotebooks();

        const expanded = computed({
            get: () => globalNav.state.notebooks.expanded,
            set: globalNav.actions.setNotebooksExpanded
        });

        const input = computed({
            get: () => globalNav.state.notebooks.input!.value,
            set: globalNav.actions.notebookInputUpdated
        });

        const formRules = {
            required: true,
            unique: [
                () => notebooks.state.values,
                (n: Notebook) => n.id,
                (n: Notebook) => n.value,
                () => globalNav.state.notebooks.input
            ]
        };

        shortcutManager.subscribe('globalNavigationCreateNotebook', () => {
            const highlighted = globalNav.state.highlight;

            if (highlighted != null && highlighted.section === 'notebook') {
                globalNav.actions.notebookInputStart({ parentId: highlighted.id });
            } else {
                globalNav.actions.notebookInputStart();
            }
        });

        return {
            expanded,
            input,
            formRules,
            getNotebookById: computed(() => notebooks.getters.byId),
            notebooks: computed(() => notebooks.state.values),
            dragging: computed(() => globalNav.state.notebooks.dragging),
            isNotebookBeingCreated: computed(() => globalNav.getters.isNotebookBeingCreated),
            isNotebookBeingDragged: computed(() => globalNav.getters.isNotebookBeingDragged),
            confirm: globalNav.actions.notebookInputConfirm,
            cancel: globalNav.actions.notebookInputCancel,
            createNotebook: globalNav.actions.notebookInputStart,
            isActive: computed(() => globalNav.getters.isActive),
            isHighlighted: computed(() => globalNav.getters.isHighlighted),
            setActive: globalNav.actions.setActive,
            count: computed(
                () => `${notebooks.getters.count} ${notebooks.getters.count === 1 ? 'notebook' : 'notebooks'}`
            )
        };
    },
    components: { GlobalNavigationNotebook, NavigationMenuForm, NavigationMenuItem, IconButton }
});
</script>
