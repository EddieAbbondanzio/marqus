<template>
    <NavigationMenuItem
        :label="modelValue.value"
        :active="isActive({ id: modelValue.id, type: 'notebook' })"
        :expanded="modelValue.expanded"
        :hideToggle="modelValue.children == null"
    >
        <GlobalNavigationNotebook
            v-for="child in modelValue.children"
            :key="child.id"
            :modelValue="child"
            :indent="indentation(notebookDepth(child) - 1)"
        />
    </NavigationMenuItem>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import Collapse from '@/components/core/Collapse.vue';
import GlobalNavigationNotebookForm from '@/components/global-navigation/GlobalNavigationNotebookForm.vue';
import { mapActions, mapGetters, useStore } from 'vuex';
import NavigationMenuItem from '@/components/core/navigation/NavigationMenuItem.vue';

export default defineComponent({
    props: {
        modelValue: Object
    },
    name: 'GlobalNavigationNotebook',
    setup: function(p, c) {
        const s = useStore();

        const expanded = computed({
            get: () => p.modelValue!.expanded,
            set: (v: any) => {
                s.commit('app/globalNavigation/NOTEBOOK_EXPANDED', {
                    notebook: p.modelValue,
                    expanded: v,
                    bubbleUp: false
                });
            }
        });

        const onClick = () => {
            s.dispatch('app/globalNavigation/setActive', { id: p.modelValue!.id, type: 'notebook' });
        };

        const input = computed({
            get: () => s.state.app.globalNavigation.notebooks.input.value,
            set: (v: string) => s.commit('app/globalNavigation/NOTEBOOK_INPUT_VALUE', v)
        });

        const onHold = () => {
            s.dispatch('app/globalNavigation/notebookDragStart', p.modelValue!);
        };

        const onRelease = (ev: any) => {
            const id = ev.target.getAttribute('data-id');
            s.dispatch('app/globalNavigation/notebookDragStop', id);
        };

        const onHover = () => {
            if (s.state.app.globalNavigation.notebooks.dragging && !p.modelValue!.expanded) {
                s.commit('app/globalNavigation/NOTEBOOK_EXPANDED', {
                    notebook: p.modelValue!,
                    expanded: true,
                    bubbleUp: false
                });
            }
        };

        return {
            expanded,
            onClick,
            input,
            onHold,
            onRelease,
            onHover
        };
    },
    computed: {
        ...mapGetters('app/globalNavigation', [
            'isNotebookBeingUpdated',
            'isNotebookBeingCreated',
            'indentation',
            'canNotebookBeCollapsed',
            'notebookDepth',
            'isActive'
        ])
    },
    methods: {
        ...mapActions('app/globalNavigation', {
            confirm: 'notebookInputConfirm',
            cancel: 'notebookInputCancel',
            onRelease: 'notebookDragStop'
        })
    },
    components: { Collapse, GlobalNavigationNotebookForm, NavigationMenuItem }
});
</script>

<style lang="sass">
.global-navigation-notebook
    height: 30px;
</style>
