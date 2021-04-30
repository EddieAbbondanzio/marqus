<template>
    <Cursor />
    <router-view></router-view>
</template>

<script lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import contextMenu from 'electron-context-menu';
import { useStore } from 'vuex';
import Cursor from '@/components/Core/Cursor.vue';

export default {
    setup() {
        const s = useStore();
        let release: (() => void) | null = null;

        onMounted(() => {
            release = contextMenu({
                menu: (da, p) => {
                    const element = document.elementFromPoint(p.x, p.y);
                    const id = element?.getAttribute('data-id');
                    const isElementNotebook = element?.classList.contains('global-navigation-notebook');
                    const isElementTag = element?.classList.contains('global-navigation-tag');

                    // we can inject menu items as needed. This is called each time we right click
                    const items = [
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
                            click: () => {
                                s.dispatch('app/globalNavigation/tagInputStart');
                            }
                        }
                    ];

                    if (isElementNotebook) {
                        items.push({
                            label: 'Edit Notebook',
                            click: () => {
                                s.dispatch('app/globalNavigation/notebookInputStart', { id });
                            }
                        });

                        items.push({
                            label: 'Delete Notebook',
                            click: () => {
                                s.dispatch('app/globalNavigation/notebookDelete', id);
                            }
                        });
                    }

                    // if tag, offer option to delete
                    if (isElementTag) {
                        items.push({
                            label: 'Edit Tag',
                            click: () => {
                                s.dispatch('app/globalNavigation/tagInputStart', id);
                            }
                        });

                        items.push({
                            label: 'Delete Tag',
                            click: () => {
                                s.dispatch('app/globalNavigation/tagDelete', id);
                            }
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
    },
    components: { Cursor }
};
</script>
