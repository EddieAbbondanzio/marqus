<template>
    <Resizable
        id="global-navigation"
        class="has-text-dark"
        v-model="width"
        minWidth="160px"
        v-context-menu:globalNavigation
    >
        <UndoContainer undoName="globalNavigation" focusName="globalNavigation">
            <NavigationMenuList>
                <NavigationMenuItem
                    icon="file-alt"
                    label="ALL"
                    :active="isActive({ section: 'all' })"
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
                    @click="setActive({ section: 'favorites' })"
                />

                <NavigationMenuItem
                    icon="trash"
                    label="TRASH"
                    :active="isActive({ section: 'trash' })"
                    @click="setActive({ section: 'trash' })"
                />
            </NavigationMenuList>
        </UndoContainer>
    </Resizable>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onBeforeUnmount } from 'vue';
import Resizable from '@/components/Resizable.vue';
import { mapActions, mapGetters, useStore } from 'vuex';
import GlobalNavigationTagSection from '@/features/ui/components/global-navigation/GlobalNavigationTagSection.vue';
import GlobalNavigationNotebookSection from '@/features/ui/components/global-navigation/GlobalNavigationNotebookSection.vue';
import NavigationMenuItem from '@/components/navigation/NavigationMenuItem.vue';
import NavigationMenuList from '@/components/navigation/NavigationMenuList.vue';
import IconButton from '@/components/IconButton.vue';
import { useGlobalNavigationContextMenu } from '@/features/ui/hooks/use-global-navigation-context-menu';
import UndoContainer from '@/components/UndoContainer.vue';
import { useGlobalNavigation } from '@/features/ui/store/modules/global-navigation';

export default defineComponent({
    setup: function() {
        const globalNav = useGlobalNavigation();
        useGlobalNavigationContextMenu();

        const width = computed({
            get: () => globalNav.state.width as string,
            set: globalNav.actions.setWidth
        });

        return {
            width,
            isActive: computed(() => globalNav.getters.isActive),
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
        UndoContainer
    }
});
</script>
