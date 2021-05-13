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
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { mapActions, mapGetters, mapState, useStore } from 'vuex';
import GlobalNavigationNotebook from '@/components/global-navigation/GlobalNavigationNotebook.vue';
import GlobalNavigationNote from '@/components/global-navigation/GlobalNavigationNote.vue';
import NavigationMenuForm from '@/components/core/navigation/NavigationMenuForm.vue';
import NavigationMenuItem from '@/components/core/navigation/NavigationMenuItem.vue';
import { Notebook } from '@/store/modules/notebooks/state';
import IconButton from '@/components/core/IconButton.vue';

export default defineComponent({
    setup: function() {
        const s = useStore();

        const expanded = computed({
            get: () => s.state.app.globalNavigation.notebooks.expanded,
            set: (v: any) => {
                s.commit('app/globalNavigation/NOTEBOOKS_EXPANDED', v);
            }
        });

        const input = computed({
            get: () => s.state.app.globalNavigation.notebooks.input.value,
            set: (v: string) => s.commit('app/globalNavigation/NOTEBOOK_INPUT_VALUE', v)
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

        return {
            expanded,
            input,
            formRules
        };
    },
    computed: {
        ...mapState('notebooks', {
            notebooks: (state: any) => state.values
        }),
        ...mapGetters('app/globalNavigation', ['isNotebookBeingCreated'])
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
