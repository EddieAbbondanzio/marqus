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
import { mapActions, mapGetters, mapState, useStore } from 'vuex';
import GlobalNavigationNotebook from '@/features/ui/components/global-navigation/GlobalNavigationNotebook.vue';
import GlobalNavigationNote from '@/global-navigation/components/GlobalNavigationNote.vue';
import NavigationMenuForm from '@/components/navigation/NavigationMenuForm.vue';
import NavigationMenuItem from '@/components/navigation/NavigationMenuItem.vue';
import { Notebook } from '@/features/notebooks/common/notebook';
import IconButton from '@/components/IconButton.vue';
import { findNotebookRecursive } from '@/features/notebooks/common/find-notebook-recursive';
import { useGlobalNavigation } from '@/features/ui/store/modules/global-navigation';

export default defineComponent({
    setup: function() {
        const s = useStore();
        const globalNav = useGlobalNavigation();

        const expanded = computed({
            get: () => s.state.ui.globalNavigation.notebooks.expanded,
            set: (v: any) => {
                s.dispatch('ui/globalNavigation/setNotebooksExpanded', v);
            }
        });

        const input = computed({
            get: () => s.state.ui.globalNavigation.notebooks.input.value,
            set: (v: string) => s.dispatch('ui/globalNavigation/notebookInputUpdated', v)
        });

        const formRules = {
            required: true,
            unique: [
                () => s.state.notebooks.values,
                (n: Notebook) => n.id,
                (n: Notebook) => n.value,
                () => s.state.ui.globalNavigation.notebooks.input
            ]
        };

        // Hack
        const getNotebookById = (id: string) => findNotebookRecursive(s.state.notebooks.values, id)!;

        return {
            expanded,
            input,
            formRules,
            getNotebookById
        };
    },
    computed: {
        ...mapState('notebooks', {
            notebooks: (state: any) => state.values
        }),
        ...mapState('ui/globalNavigation', { dragging: (s: any) => s.notebooks.dragging }),
        ...mapGetters('ui/globalNavigation', ['isNotebookBeingCreated', 'isNotebookBeingDragged'])
    },
    methods: {
        ...mapActions('ui/globalNavigation', {
            confirm: 'notebookInputConfirm',
            cancel: 'notebookInputCancel',
            createNotebook: 'notebookInputStart'
        })
    },
    components: { GlobalNavigationNotebook, NavigationMenuForm, NavigationMenuItem, IconButton }
});
</script>
