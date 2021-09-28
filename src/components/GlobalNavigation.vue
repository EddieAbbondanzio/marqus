<template>
    <Resizable
        id="global-navigation"
        class="has-text-dark"
        v-model="width"
        minWidth="160px"
        v-context-menu:globalNavigation
        v-input-scope:globalNavigation
        v-shortcut:focusGlobalNavigation.global="focus"
        v-shortcut:delete="deleteHighlightItem"
        v-shortcut:enter="setHighlightActive"
        v-shortcut:escape="clearHighlight"
        v-shortcut:moveSelectionUp="moveHighlightUp"
        v-shortcut:moveSelectionDown="moveHighlightDown"
        v-shortcut:toggleSelection="toggleHighlighted"
        v-shortcut:globalNavigationExpandAll="expandAll"
        v-shortcut:globalNavigationCollapseAll="collapseAll"
        v-shortcut:undo="undo"
        v-shortcut:redo="redo"
        v-shortcut:rename="rename"
    >
        <Scrollable v-model="scrollPosition" v-shortcut:scrollUp="scrollUp" v-shortcut:scrollDown="scrollDown">
            <NavigationMenuItem
                icon="file-alt"
                label="ALL"
                :active="isActive({ section: 'all' })"
                :highlight="isHighlighted({ section: 'all' })"
                @click="setActive({ section: 'all' })"
                :hideToggle="true"
            >
                <template #options>
                    <IconButton
                        icon="fa-angle-double-down"
                        class="has-text-grey"
                        size="is-size-7"
                        title="Expand all"
                        @click="expandAll()"
                    />
                    <IconButton
                        icon="fa-angle-double-up"
                        class="has-text-grey"
                        size="is-size-7"
                        title="Collapse all"
                        @click="collapseAll()"
                    />
                </template>
            </NavigationMenuItem>

            <GlobalNavigationNotebookSection />

            <GlobalNavigationTagSection />

            <NavigationMenuItem
                icon="star"
                label="FAVORITES"
                :active="isActive({ section: 'favorites' })"
                :highlight="isHighlighted({ section: 'favorites' })"
                @click="setActive({ section: 'favorites' })"
            />

            <NavigationMenuItem
                icon="trash"
                label="TRASH"
                :active="isActive({ section: 'trash' })"
                :highlight="isHighlighted({ section: 'trash' })"
                @click="setActive({ section: 'trash' })"
            />
        </Scrollable>
    </Resizable>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import Resizable from '@/components/layout/Resizable.vue';
import GlobalNavigationTagSection from '@/components/GlobalNavigationTagSection.vue';
import GlobalNavigationNotebookSection from '@/components/GlobalNavigationNotebookSection.vue';
import NavigationMenuItem from '@/components/navigation/NavigationMenuItem.vue';
import IconButton from '@/components/buttons/IconButton.vue';
import { useGlobalNavigationContextMenu } from '@/hooks/use-global-navigation-context-menu';
import Scrollable from '@/components/layout/Scrollable.vue';
import { inputScopes } from '@/utils/scopes';
import { mapUndoRedo } from '@/store/plugins/undo/utils/map-undo-redo';
import { useGlobalNavigation } from '@/store/modules/ui/modules/global-navigation';

export default defineComponent({
    setup: function() {
        const globalNav = useGlobalNavigation();
        useGlobalNavigationContextMenu();

        const width = computed({
            get: () => globalNav.state.width as string,
            set: globalNav.actions.setWidth
        });

        const scrollPosition = computed({
            get: () => globalNav.state.scrollPosition,
            set: (v: any) => {
                globalNav.actions.setScrollPosition(v);
            }
        });

        const setHighlightActive = () => {
            if (globalNav.state.highlight != null) {
                globalNav.actions.setActive(globalNav.state.highlight);
            }
        };

        const deleteHighlightItem = () => {
            const highlight = globalNav.state.highlight;

            switch (highlight?.section) {
                case 'notebook':
                    if (highlight.id != null) globalNav.actions.notebookDelete(highlight.id);
                    break;

                case 'tag':
                    if (highlight.id != null) globalNav.actions.tagDelete(highlight.id);
                    break;
            }
        };

        const rename = () => {
            const highlight = globalNav.state.highlight;

            switch (highlight?.section) {
                case 'notebook':
                    if (highlight.id != null) globalNav.actions.notebookInputStart({ id: highlight.id });
                    break;
                case 'tag':
                    if (highlight.id != null) globalNav.actions.tagInputStart({ id: highlight.id });
                    break;
            }
        };

        return {
            width,
            scrollPosition,
            rename,
            deleteHighlightItem,
            setHighlightActive,
            scrollUp: () => globalNav.actions.scrollUp(),
            scrollDown: () => globalNav.actions.scrollDown(),
            clearHighlight: () => globalNav.actions.clearHighlight(),
            moveHighlightUp: () => globalNav.actions.moveHighlightUp(),
            moveHighlightDown: () => globalNav.actions.moveHighlightDown(),
            isActive: computed(() => globalNav.getters.isActive),
            isHighlighted: computed(() => globalNav.getters.isHighlighted),
            expandAll: globalNav.actions.expandAll,
            collapseAll: globalNav.actions.collapseAll,
            setActive: globalNav.actions.setActive,
            toggleHighlighted: () => globalNav.actions.toggleHighlighted(),
            ...mapUndoRedo({ name: 'globalNavigation' }),
            focus: () => inputScopes.focus({ name: 'globalNavigation' })
        };
    },
    components: {
        Resizable,
        GlobalNavigationTagSection,
        GlobalNavigationNotebookSection,
        NavigationMenuItem,
        IconButton,
        Scrollable
    }
});
</script>
