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
                prepend: (da, p) => [
                    {
                        label: 'Cat'
                    }
                ],
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
