<template>
    <NavigationMenuItem icon="book" label="NOTEBOOKS" v-model:expanded="expanded" :toggleAnywhere="true">
        <template #options>
            <IconButton
                icon="fa-plus"
                class="has-text-grey is-size-7 has-text-hover-success"
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
import IconButton from '@/components/IconButton.vue';
import { useGlobalNavigation } from '@/features/ui/store/modules/global-navigation';
import { useNotebooks } from '@/features/notebooks/store';

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
            createNotebook: globalNav.actions.notebookInputStart
        };
    },
    components: { GlobalNavigationNotebook, NavigationMenuForm, NavigationMenuItem, IconButton }
});
</script>
