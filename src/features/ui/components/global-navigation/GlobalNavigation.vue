<template>
    <Resizable
        id="global-navigation"
        class="has-text-dark"
        v-model="width"
        minWidth="160px"
        data-context-menu="globalNavigation"
        v-focusable:globalNavigation
        v-shortcut:undo="onUndo"
        v-shortcut:redo="onRedo"
    >
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

            <global-navigation-notebook-section />

            <global-navigation-tag-section />

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

export default defineComponent({
    setup: function() {
        const s = useStore();

        const width = computed({
            get: () => s.state.ui.globalNavigation.width as string,
            set: (w: any) => {
                s.dispatch('ui/globalNavigation/setWidth', w);
            }
        });

        let release: (() => void) | null = null;

        onMounted(() => {
            release = contextMenu({
                menu: (_, p) => {
                    const element = document.elementFromPoint(p.x, p.y) as HTMLElement;

                    const isElementNotebook = climbDomHierarchy<boolean>(element, {
                        match: (el) => el.classList.contains('global-navigation-notebook')
                    });

                    const isElementTag = climbDomHierarchy<boolean>(element, {
                        match: (el) => el.classList.contains('global-navigation-tag')
                    });

                    const id = climbDomHierarchy<string>(element, {
                        match: (el) => el.hasAttribute('data-id'),
                        matchValue: (el) => el.getAttribute('data-id')
                    });

                    // we can inject menu items as needed. This is called each time we right click
                    const items = [
                        {
                            label: 'Expand All',
                            click: () => s.dispatch('ui/globalNavigation/expandAll')
                        },
                        {
                            label: 'Collapse All',
                            click: () => s.dispatch('ui/globalNavigation/collapseAll')
                        },
                        {
                            type: 'separator' as any
                        },
                        {
                            label: 'Create Notebook',
                            click: () => {
                                if (isElementNotebook) {
                                    s.dispatch('ui/globalNavigation/notebookInputStart', { parentId: id });
                                } else {
                                    s.dispatch('ui/globalNavigation/notebookInputStart');
                                }
                            }
                        },
                        {
                            label: 'Create Tag',
                            click: () => s.dispatch('ui/globalNavigation/tagInputStart')
                        }
                    ];

                    if (isElementNotebook) {
                        items.push({
                            label: 'Edit Notebook',
                            click: () => s.dispatch('ui/globalNavigation/notebookInputStart', { id })
                        });

                        items.push({
                            label: 'Delete Notebook',
                            click: () => s.dispatch('ui/globalNavigation/notebookDelete', id)
                        });
                    }

                    // if tag, offer option to delete
                    if (isElementTag) {
                        items.push({
                            label: 'Edit Tag',
                            click: () => s.dispatch('ui/globalNavigation/tagInputStart', { id })
                        });

                        items.push({
                            label: 'Delete Tag',
                            click: () => s.dispatch('ui/globalNavigation/tagDelete', id)
                        });
                    }

                    items.push({
                        label: 'Empty Trash',
                        click: () => s.dispatch('ui/globalNavigation/emptyTrash')
                    });
                    return items;
                },
                shouldShowMenu: (e, p) => {
                    const element = document.elementFromPoint(p.x, p.y) as HTMLElement;

                    const menuName = climbDomHierarchy(element, {
                        match: (el) => el.hasAttribute('data-context-menu'),
                        matchValue: (el) => el.getAttribute('data-context-menu')
                    });

                    return menuName === 'globalNavigation';
                }
            });
        });

        onBeforeUnmount(() => {
            if (release != null) {
                release();
            }
        });

        const onUndo = () => {
            if (focusManager.isFocused('globalNavigation')) {
                const m = undo.getModule('globalNavigation');

                if (m.canUndo()) {
                    m.undo();
                } else {
                    console.log('nothing to undo');
                }
            }
        };

        const onRedo = () => {
            if (focusManager.isFocused('globalNavigation')) {
                const m = undo.getModule('globalNavigation');

                if (m.canRedo()) {
                    console.log('redo');
                    m.redo();
                } else {
                    console.log('nothing to redo');
                }
            }
        };

        return {
            width,
            onUndo,
            onRedo
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
        IconButton
    }
});
</script>

<style lang="sass" scoped>
#global-navigation
    outline: none!important
    border: none!important
    resize: none!important
</style>
