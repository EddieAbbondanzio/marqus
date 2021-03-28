<template>
    <router-view></router-view>
</template>

<script lang="ts">
import { onMounted } from 'vue';
import { store } from './store/store';
import contextMenu from 'electron-context-menu';
import { useStore } from 'vuex';

export default {
    setup() {
        const s = useStore();

        onMounted(() => {
            contextMenu({
                menu: (da, p) => {
                    // we can inject menu items as needed. This is called each time we right click
                    const items = [
                        {
                            label: 'Create Notebook'
                        },
                        {
                            label: 'Create Tag',
                            click: () => {
                                s.dispatch('editor/createTag');
                            }
                        }
                    ];

                    const element = document.elementFromPoint(p.x, p.y);

                    // if tag, offer option to delete
                    if (element?.classList.contains('global-navigation-tag')) {
                        const id = element.getAttribute('data-id');

                        items.push({
                            label: 'Edit Tag',
                            click: () => {
                                s.dispatch('editor/updateTag', id);
                            }
                        });

                        items.push({
                            label: 'Delete Tag',
                            click: () => {
                                s.dispatch('editor/deleteTag', id);
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
    }
};
</script>
