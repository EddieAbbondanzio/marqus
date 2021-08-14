<template>
    <Resizable
        id="global-navigation"
        class="has-text-dark"
        v-model="width"
        minWidth="160px"
        v-context-menu:globalNavigation
        v-shortcut:globalNavigationDeleteHighlightItem="deleteHighlightItem"
        v-shortcut:globalNavigationSetHighlightActive="setHighlightActive"
        v-shortcut:globalNavigationClearHighlight="clearHighlight"
        v-shortcut:globalNavigationMoveHighlightUp="moveHighlightUp"
        v-shortcut:globalNavigationMoveHighlightDown="moveHighlightDown"
    >
        <Scrollable
            v-model="scrollPosition"
            v-shortcut:globalNavigationScrollUp="onScrollUp"
            v-shortcut:globalNavigationScrollDown="onScrollDown"
        >
            <UndoContainer undoName="globalNavigation" focusName="globalNavigation">
                <NavigationMenuList>
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
                </NavigationMenuList>
            </UndoContainer>
        </Scrollable>
    </Resizable>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import Resizable from '@/components/layout/Resizable.vue';
import GlobalNavigationTagSection from '@/features/ui/components/global-navigation/GlobalNavigationTagSection.vue';
import GlobalNavigationNotebookSection from '@/features/ui/components/global-navigation/GlobalNavigationNotebookSection.vue';
import NavigationMenuItem from '@/components/navigation/NavigationMenuItem.vue';
import NavigationMenuList from '@/components/navigation/NavigationMenuList.vue';
import IconButton from '@/components/buttons/IconButton.vue';
import { useGlobalNavigationContextMenu } from '@/features/ui/hooks/use-global-navigation-context-menu';
import UndoContainer from '@/components/input/UndoContainer.vue';
import Scrollable from '@/components/layout/Scrollable.vue';
import { useGlobalNavigation } from '@/features/ui/store/modules/global-navigation';

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
            set: globalNav.actions.setScrollPosition
        });

        const setHighlightActive = () => {
            if (globalNav.state.highlight == null) {
                return;
            }

            globalNav.actions.setActive(globalNav.state.highlight);
        };

        const deleteHighlightItem = () => {
            const highlight = globalNav.state.highlight;

            if (
                highlight == null ||
                highlight.section === 'all' ||
                highlight.section === 'favorites' ||
                highlight.section === 'trash'
            ) {
                return;
            }

            switch (highlight.section) {
                case 'notebook':
                    globalNav.actions.notebookDelete(highlight.id);
                    break;

                case 'tag':
                    globalNav.actions.tagDelete(highlight.id);
                    break;
            }
        };

        const onScrollUp = () => globalNav.actions.incrementScrollPosition(-30);
        const onScrollDown = () => globalNav.actions.incrementScrollPosition(30);

        return {
            onScrollUp,
            onScrollDown,
            deleteHighlightItem,
            setHighlightActive,
            clearHighlight: () => globalNav.actions.clearHighlight(),
            moveHighlightUp: () => globalNav.actions.moveHighlightUp(),
            moveHighlightDown: () => globalNav.actions.moveHighlightDown(),
            width,
            scrollPosition,
            isActive: computed(() => globalNav.getters.isActive),
            isHighlighted: computed(() => globalNav.getters.isHighlighted),
            expandAll: globalNav.actions.expandAll,
            collapseAll: globalNav.actions.collapseAll,
            setActive: globalNav.actions.setActive
        };
    },
    components: {
        Resizable,
        GlobalNavigationTagSection,
        GlobalNavigationNotebookSection,
        NavigationMenuItem,
        NavigationMenuList,
        IconButton,
        UndoContainer,
        Scrollable
    }
});
</script>
