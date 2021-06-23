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
import GlobalNavigationNotebook from '@/modules/app/components/global-navigation/GlobalNavigationNotebook.vue';
import GlobalNavigationNote from '@/global-navigation/components/GlobalNavigationNote.vue';
import NavigationMenuForm from '@/common/components/navigation/NavigationMenuForm.vue';
import NavigationMenuItem from '@/common/components/navigation/NavigationMenuItem.vue';
import { Notebook } from '@/modules/notebooks/common/notebook';
import IconButton from '@/common/components/IconButton.vue';
import { findNotebookRecursive } from '@/modules/notebooks/store/mutations';

export default defineComponent({
    setup: function() {
        const s = useStore();

        const expanded = computed({
            get: () => s.state.app.globalNavigation.notebooks.expanded,
            set: (v: any) => {
                s.dispatch('app/globalNavigation/setNotebooksExpanded', v);
            }
        });

        const input = computed({
            get: () => s.state.app.globalNavigation.notebooks.input.value,
            set: (v: string) => s.dispatch('app/globalNavigation/notebookInputUpdated', v)
        });

        const formRules = {
            required: true,
            unique: [
                () => s.state.notebooks.values,
                (n: Notebook) => n.id,
                (n: Notebook) => n.value,
                () => s.state.app.globalNavigation.notebooks.input
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
        ...mapState('app/globalNavigation', { dragging: (s: any) => s.notebooks.dragging }),
        ...mapGetters('app/globalNavigation', ['isNotebookBeingCreated', 'isNotebookBeingDragged'])
    },
    methods: {
        ...mapActions('app/globalNavigation', {
            confirm: 'notebookInputConfirm',
            cancel: 'notebookInputCancel',
            createNotebook: 'notebookInputStart'
        })
    },
    components: { GlobalNavigationNotebook, NavigationMenuForm, NavigationMenuItem, IconButton }
});
</script>
