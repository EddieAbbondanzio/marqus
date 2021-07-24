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
                            title="Expand all"
                            @click="expandAll()"
                        />
                        <IconButton
                            icon="fa-angle-double-up"
                            class="has-text-grey"
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
import contextMenu from 'electron-context-menu';
import IconButton from '@/components/IconButton.vue';
import { focusManager } from '@/directives/focusable';
import { undo } from '@/store/plugins/undo/undo';
import { climbDomHierarchy } from '@/shared/utils';
import { useGlobalNavigationContextMenu } from '@/features/ui/hooks/use-global-navigation-context-menu';
import UndoContainer from '@/components/UndoContainer.vue';

export default defineComponent({
    setup: function() {
        const s = useStore();

        const width = computed({
            get: () => s.state.ui.globalNavigation.width as string,
            set: (w: any) => {
                s.dispatch('ui/globalNavigation/setWidth', w);
            }
        });

        useGlobalNavigationContextMenu();
        console.log('on setup!');

        // const onUndo = () => {
        //     if (focusManager.isFocused('globalNavigation')) {
        //         const m = undo.getModule('globalNavigation');

        //         if (m.canUndo()) {
        //             m.undo();
        //         } else {
        //             console.log('nothing to undo');
        //         }
        //     }
        // };

        // const onRedo = () => {
        //     if (focusManager.isFocused('globalNavigation')) {
        //         const m = undo.getModule('globalNavigation');

        //         if (m.canRedo()) {
        //             console.log('redo');
        //             m.redo();
        //         } else {
        //             console.log('nothing to redo');
        //         }
        //     }
        // };

        return {
            width
            // onUndo,
            // onRedo
        };
    },
    computed: {
        ...mapGetters('ui/globalNavigation', ['isActive'])
    },
    methods: {
        ...mapActions('ui/globalNavigation', ['expandAll', 'collapseAll', 'setActive'])
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

<style lang="sass" scoped>
#global-navigation
    outline: none!important
    border: none!important
    resize: none!important
</style>
