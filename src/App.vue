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
                    console.log('BUILD MENU');
                    return [
                        {
                            label: 'Create Notebook'
                        },
                        {
                            label: 'Create Tag',
                            click: () => {
                                console.log('create notebook!', s);
                                s.commit('editor/CREATE_TAG');
                            }
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
