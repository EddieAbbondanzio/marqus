<template>
    <NavigationMenuItem icon="book" label="NOTEBOOKS" v-model:expanded="expanded">
        <GlobalNavigationNotebookForm
            v-if="isNotebookBeingCreated()"
            @submit="confirm"
            @cancel="cancel"
            v-model="input"
        />
        <GlobalNavigationNotebook v-for="notebook in notebooks" :key="notebook.id" :modelValue="notebook" />
    </NavigationMenuItem>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { mapActions, mapGetters, mapState, useStore } from 'vuex';
import GlobalNavigationNotebook from '@/components/global-navigation/GlobalNavigationNotebook.vue';
import GlobalNavigationNote from '@/components/global-navigation/GlobalNavigationNote.vue';
import GlobalNavigationNotebookForm from '@/components/global-navigation/GlobalNavigationNotebookForm.vue';
import NavigationMenuItem from '@/components/core/navigation/NavigationMenuItem.vue';

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

        return {
            expanded,
            input
        };
    },
    computed: {
        ...mapState('notebooks', {
            notebooks: (state: any) => state.values
        }),
        ...mapGetters('app/globalNavigation', ['isNotebookBeingCreated'])
    },
    methods: {
        ...mapActions('app/globalNavigation', { confirm: 'notebookInputConfirm', cancel: 'notebookInputCancel' })
    },
    components: { GlobalNavigationNotebook, GlobalNavigationNotebookForm, NavigationMenuItem }
});
</script>
