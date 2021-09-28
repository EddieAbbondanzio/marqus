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
                :disabled="isNotebookBeingCreated()"
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
import GlobalNavigationNotebook from '@/components/GlobalNavigationNotebook.vue';
import NavigationMenuForm from '@/components/navigation/NavigationMenuForm.vue';
import NavigationMenuItem from '@/components/navigation/NavigationMenuItem.vue';
import IconButton from '@/components/buttons/IconButton.vue';
import { useNotebooks } from '@/store/modules/notebooks';
import { Notebook } from '@/store/modules/notebooks/state';
import { useGlobalNavigation } from '@/store/modules/ui/modules/global-navigation';
import { shortcuts } from '@/utils/shortcuts/shortcuts';

export default defineComponent({
    setup: function() {
        const globalNav = useGlobalNavigation();
        const notebooks = useNotebooks();

        const expanded = computed({
            get: () => globalNav.state.notebooks.expanded,
            set: globalNav.actions.setNotebooksExpanded
        });

        const input = computed({
            get: () => globalNav.state.notebooks.input!.name,
            set: globalNav.actions.notebookInputUpdated
        });

        const formRules = {
            required: true,
            unique: [
                () => notebooks.state.values,
                (n: Notebook) => n.id,
                (n: Notebook) => n.name,
                () => globalNav.state.notebooks.input
            ]
        };

        shortcuts.subscribe('globalNavigationCreateNotebook', () => {
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
