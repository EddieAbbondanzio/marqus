<template>
    <router-view></router-view>
</template>

<script lang="ts">
import { onMounted } from 'vue';
import { store } from './store/store';
import contextMenu from 'electron-context-menu';
export default {
    setup() {
        onMounted(() => {
            contextMenu({
                menu: (da, p) => {
                    // we can inject menu items as needed. This is called each time we right click
                    console.log('BUILD MENU');
                    return [
                        {
                            label: 'Create Notebook',
                            click: () => console.log('create notebook!')
                        },
                        {
                            label: 'Create Tag'
                        }
                    ];
                },
                shouldShowMenu: (e, p) => {
                    let element = document.elementFromPoint(p.x, p.y);
                    console.log('target: ', element);

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
