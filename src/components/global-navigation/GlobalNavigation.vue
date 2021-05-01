<template>
    <Resizable class="has-text-dark" v-model="width" minWidth="160px" data-context-menu="globalNavigation">
        <NavigationMenuList>
            <NavigationMenuItem icon="file-alt" label="ALL" :active="isActive('all')" @click="ACTIVE('all')" />

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
import { computed, defineComponent, getCurrentInstance, ref, WritableComputedRef, provide, onMounted } from 'vue';
import Resizable from '@/components/core/Resizable.vue';
import { mapGetters, mapMutations, useStore } from 'vuex';
import GlobalNavigationTagSection from '@/components/global-navigation/GlobalNavigationTagSection.vue';
import GlobalNavigationNotebookSection from '@/components/global-navigation/GlobalNavigationNotebookSection.vue';
import NavigationMenuItem from '@/components/core/navigation/NavigationMenuItem.vue';
import NavigationMenuList from '@/components/core/navigation/NavigationMenuList.vue';

export default defineComponent({
    setup: function() {
        const s = useStore();

        const width = computed({
            get: () => s.state.app.globalNavigation.width as string,
            set: (w: any) => {
                s.commit('app/globalNavigation/WIDTH', w);
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
        ...mapMutations('app/globalNavigation', ['ACTIVE'])
    },
    components: {
        Resizable,
        GlobalNavigationTagSection,
        GlobalNavigationNotebookSection,
        NavigationMenuItem,
        NavigationMenuList
    }
});
</script>
