<template>
    <NavigationMenuItem
        :label="modelValue.value"
        :active="isActive({ id: modelValue.id, type: 'notebook' })"
        :expanded="modelValue.expanded"
        :hideToggle="modelValue.children == null && !isNotebookBeingCreated(modelValue.id)"
        class="global-navigation-notebook"
        :data-id="modelValue.id"
        :indent="indentation(notebookDepth(modelValue) - 1)"
    >
        <NavigationMenuForm
            v-if="isNotebookBeingCreated(modelValue.id)"
            @submit="confirm"
            @cancel="cancel"
            v-model="input"
            fieldName="Notebook"
            :rules="formRules"
            :indent="indentation(notebookDepth(modelValue) + 1)"
        />

        <template v-for="child in modelValue.children" :key="child.id">
            <GlobalNavigationNotebook :modelValue="child" />
        </template>
    </NavigationMenuItem>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { mapActions, mapGetters, useStore } from 'vuex';
import NavigationMenuItem from '@/components/core/navigation/NavigationMenuItem.vue';
import NavigationMenuForm from '@/components/core/navigation/NavigationMenuForm.vue';
import { Notebook } from '@/store/modules/notebooks/state';
import { findNotebookRecursive } from '@/store/modules/notebooks/mutations';

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

        const formRules = {
            required: true,
            unique: [
                () => {
                    /*
                     * Form is on a child. Therefore, .children of the modelValue will return it's
                     * siblings even though it seems like we're going to get the wrong notebooks.
                     */
                    const siblings = p.modelValue!.children;
                    return siblings;
                },
                (n: Notebook) => n.id,
                (n: Notebook) => n.value,
                () => s.state.app.globalNavigation.notebooks.input
            ]
        };

        return {
            expanded,
            onClick,
            input,
            onHold,
            onRelease,
            onHover,
            formRules
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
    components: { NavigationMenuForm, NavigationMenuItem }
});
</script>
