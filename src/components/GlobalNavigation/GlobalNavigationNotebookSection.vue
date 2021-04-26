<template>
    <li class="has-text-grey is-size-7">
        <Collapse v-model="expanded" triggerClass="has-background-hover-light">
            <template #trigger>
                <div class="is-flex is-align-center has-background-transparent global-navigation-title">
                    <span class="icon">
                        <i class="fas fa-book"></i>
                    </span>
                    <span class="is-size-7 is-uppercase">Notebooks</span>
                </div>
            </template>

            <div class="is-size-7">
                <div v-if="isNotebookBeingCreated()">
                    <GlobalNavigationNotebookForm @submit="confirm" @cancel="cancel" v-model="input" />
                </div>
                <div v-for="notebook in notebooks" :key="notebook.id">
                    <GlobalNavigationNotebook :modelValue="notebook" />
                </div>
            </div>
        </Collapse>
    </li>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { mapActions, mapGetters, mapState, useStore } from 'vuex';
import Collapse from '@/components/Collapse.vue';
import GlobalNavigationNotebook from '@/components/GlobalNavigation/GlobalNavigationNotebook.vue';
import GlobalNavigationNote from '@/components/GlobalNavigation/GlobalNavigationNote.vue';
import GlobalNavigationNotebookForm from '@/components/GlobalNavigation/GlobalNavigationNotebookForm.vue';

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
    components: { Collapse, GlobalNavigationNotebook, GlobalNavigationNotebookForm }
});
</script>
