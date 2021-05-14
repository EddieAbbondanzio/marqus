<template>
    <!-- Normal rendering -->
    <NavigationMenuItem
        v-if="!isNotebookBeingUpdated(modelValue.id)"
        :label="modelValue.value"
        :active="isActive({ id: modelValue.id, type: 'notebook' })"
        :expanded="modelValue.expanded"
        @update:expanded="(v) => (expanded = v)"
        :hideToggle="modelValue.children == null && !isNotebookBeingCreated(modelValue.id)"
        class="global-navigation-notebook"
        :data-id="modelValue.id"
        :indent="indentation(depth - 1)"
        v-mouse:click.left="() => setActive({ id: modelValue.id, type: 'notebook' })"
        v-mouse:hold.left="onHold"
        v-mouse:drag.left="onHover"
        v-mouse:release.left="onRelease"
    >
        <NavigationMenuForm
            v-if="isNotebookBeingCreated(modelValue.id)"
            @submit="confirm"
            @cancel="cancel"
            v-model="input"
            fieldName="Notebook"
            :rules="formRules"
            :indent="indentation(depth + 1)"
        />

        <template v-for="child in modelValue.children" :key="child.id">
            <GlobalNavigationNotebook :modelValue="child" :depth="depth + 1" />
        </template>
    </NavigationMenuItem>
    <!-- Edit rendering of notebook -->
    <NavigationMenuForm
        v-else
        @submit="confirm"
        @cancel="cancel"
        v-model="input"
        fieldName="Notebook"
        :rules="formRules"
        :indent="indentation(depth)"
    >
        <template v-for="child in modelValue.children" :key="child.id">
            <GlobalNavigationNotebook :modelValue="child" :depth="depth + 1" />
        </template>
    </NavigationMenuForm>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { mapActions, mapGetters, useStore } from 'vuex';
import NavigationMenuItem from '@/components/core/navigation/NavigationMenuItem.vue';
import NavigationMenuForm from '@/components/core/navigation/NavigationMenuForm.vue';
import { Notebook } from '@/store/modules/notebooks/state';
import { findNotebookRecursive } from '@/store/modules/notebooks/mutations';
import { climbDomHierarchy } from '@/utils/dom/climb-dom-hierarchy';

export default defineComponent({
    props: {
        modelValue: Object,
        depth: {
            type: Number,
            default: 1
        }
    },
    name: 'GlobalNavigationNotebook',
    setup: function(p, c) {
        const s = useStore();

        const expanded = computed({
            get: () => p.modelValue!.expanded,
            set: (v: any) => {
                s.commit('notebooks/EXPANDED', {
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
            const src = document.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement;

            /**
             * Try to find the id of the notebook we ended on. We may need to climb the DOM
             * as target could be a nested element inside of NavigationMenuItem.
             */
            const id = climbDomHierarchy<string>(src, {
                match: (el) => el.classList.contains('global-navigation-notebook') && el.hasAttribute('data-id'),
                matchValue: (el) => el.getAttribute('data-id'),
                defaultValue: () => null
            });

            console.log(ev.target);

            s.dispatch('app/globalNavigation/notebookDragStop', id);
        };

        const onHover = (ev: any) => {
            const src = document.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement;

            // Get the other notebook we dragged over
            const id = climbDomHierarchy(src, {
                match: (el) => el.classList.contains('global-navigation-notebook') && el.hasAttribute('data-id'),
                matchValue: (el) => el.getAttribute('data-id')
            });

            if (id == null) {
                return;
            }

            const otherNotebook: Notebook = s.state.notebooks.values.find((n: Notebook) => n.id === id);

            if (otherNotebook == null) {
                return;
            }

            if (s.state.app.globalNavigation.notebooks.dragging && !otherNotebook.expanded) {
                s.commit('notebooks/EXPANDED', {
                    notebook: otherNotebook,
                    expanded: true,
                    bubbleUp: false
                });
            }
        };

        const formRules = {
            required: true,
            unique: [
                () => {
                    switch (s.state.app.globalNavigation.notebooks.input.mode) {
                        case 'update':
                            return p.modelValue!.parent == null
                                ? s.state.notebooks.values
                                : p.modelValue!.parent.children;

                        case 'create':
                            return p.modelValue!.children ?? [];

                        default:
                            throw Error();
                    }
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
            'isActive'
        ])
    },
    methods: {
        ...mapActions('app/globalNavigation', {
            confirm: 'notebookInputConfirm',
            cancel: 'notebookInputCancel',
            onRelease: 'notebookDragStop',
            setActive: 'setActive'
        })
    },
    components: { NavigationMenuForm, NavigationMenuItem }
});
</script>
