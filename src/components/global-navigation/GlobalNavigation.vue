<template>
    <Resizable
        id="globalNavigation"
        class="has-text-dark"
        v-model="width"
        minWidth="160px"
        data-context-menu="globalNavigation"
    >
        <NavigationMenuList>
            <NavigationMenuItem
                icon="file-alt"
                label="ALL"
                :active="isActive('all')"
                @click="ACTIVE('all')"
                :hideToggle="true"
            >
                <template #options>
                    <IconButton
                        icon="fa-angle-double-down"
                        class="p-1 mr-1"
                        style="height: 30px!important"
                        title="Expand all"
                        @click="expandAll()"
                    />
                    <IconButton
                        icon="fa-angle-double-up"
                        class="p-1"
                        style="height: 30px!important"
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
                :active="isActive('favorites')"
                @click="ACTIVE('favorites')"
            />

            <NavigationMenuItem icon="trash" label="TRASH" :active="isActive('trash')" @click="ACTIVE('trash')" />
        </NavigationMenuList>
    </Resizable>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onBeforeUnmount } from 'vue';
import Resizable from '@/components/core/Resizable.vue';
import { mapActions, mapGetters, mapMutations, useStore } from 'vuex';
import GlobalNavigationTagSection from '@/components/global-navigation/GlobalNavigationTagSection.vue';
import GlobalNavigationNotebookSection from '@/components/global-navigation/GlobalNavigationNotebookSection.vue';
import NavigationMenuItem from '@/components/core/navigation/NavigationMenuItem.vue';
import NavigationMenuList from '@/components/core/navigation/NavigationMenuList.vue';
import contextMenu from 'electron-context-menu';
import { climbDomHierarchy } from '@/utils/dom/climb-dom-hierarchy';
import IconButton from '@/components/core/IconButton.vue';

export default defineComponent({
    setup: function() {
        const s = useStore();

        const width = computed({
            get: () => s.state.app.globalNavigation.width as string,
            set: (w: any) => {
                s.commit('app/globalNavigation/WIDTH', w);
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
                            click: () => s.dispatch('app/globalNavigation/expandAll')
                        },
                        {
                            label: 'Collapse All',
                            click: () => s.dispatch('app/globalNavigation/collapseAll')
                        },
                        {
                            type: 'separator' as any
                        },
                        {
                            label: 'Create Notebook',
                            click: () => {
                                if (isElementNotebook) {
                                    s.dispatch('app/globalNavigation/notebookInputStart', { parentId: id });
                                } else {
                                    s.dispatch('app/globalNavigation/notebookInputStart');
                                }
                            }
                        },
                        {
                            label: 'Create Tag',
                            click: () => s.dispatch('app/globalNavigation/tagInputStart')
                        }
                    ];

                    if (isElementNotebook) {
                        items.push({
                            label: 'Edit Notebook',
                            click: () => s.dispatch('app/globalNavigation/notebookInputStart', { id })
                        });

                        items.push({
                            label: 'Delete Notebook',
                            click: () => s.dispatch('app/globalNavigation/notebookDelete', id)
                        });
                    }

                    // if tag, offer option to delete
                    if (isElementTag) {
                        items.push({
                            label: 'Edit Tag',
                            click: () => s.dispatch('app/globalNavigation/tagInputStart', id)
                        });

                        items.push({
                            label: 'Delete Tag',
                            click: () => s.dispatch('app/globalNavigation/tagDelete', id)
                        });
                    }
                    return items;
                },
                shouldShowMenu: (e, p) => {
                    let element = document.elementFromPoint(p.x, p.y);

                    // Climb up parent tree until we find our attribute.
                    while (element != null && !element.hasAttribute('data-context-menu')) {
                        element = element.parentElement;
                    }

                    if (element == null) {
                        return false;
                    }

                    const menuName = element.getAttribute('data-context-menu');
                    return menuName === 'globalNavigation';
                }
            });
        });

        onBeforeUnmount(() => {
            if (release != null) {
                release();
            }
        });

        return {
            width
        };
    },
    computed: {
        ...mapGetters('app/globalNavigation', ['isActive'])
    },
    methods: {
        ...mapMutations('app/globalNavigation', ['ACTIVE']),
        ...mapActions('app/globalNavigation', ['expandAll', 'collapseAll'])
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
