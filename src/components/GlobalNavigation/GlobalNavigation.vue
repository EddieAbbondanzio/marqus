<template>
    <resizable class="has-text-dark" v-model="width" @resizeStop="save" data-context-menu="globalNavigation">
        <ul>
            <li class="m-1 is-uppercase has-text-grey is-size-7">
                <div class="is-flex is-align-center">
                    <span class="icon">
                        <i class="fas fa-file-alt"></i>
                    </span>
                    <span>All</span>
                </div>
            </li>

            <global-navigation-notebooks-section />

            <global-navigation-tags-section />

            <li class="m-1 is-uppercase has-text-grey is-size-7">
                <div>
                    <span class="icon">
                        <i class="fas fa-star"></i>
                    </span>
                    <span>Favorites</span>
                </div>
            </li>
            <li class="m-1 is-uppercase has-text-grey is-size-7">
                <div>
                    <span class="icon">
                        <i class="fas fa-trash"></i>
                    </span>
                    <span>Trash</span>
                </div>
            </li>
        </ul>
    </resizable>
</template>

<script lang="ts">
import { computed, defineComponent, getCurrentInstance, ref, WritableComputedRef, provide, onMounted } from 'vue';
import Resizable from '@/components/Resizable.vue';
import { useStore } from 'vuex';
import GlobalNavigationTagsSection from '@/components/GlobalNavigation/GlobalNavigationTagsSection.vue';
import GlobalNavigationNotebooksSection from '@/components/GlobalNavigation/GlobalNavigationNotebooksSection.vue';

export default defineComponent({
    setup: function() {
        const s = useStore();

        const width = computed({
            get: () => s.state.editor.globalNavigation.width as string,
            set: (v: any) => s.commit('editor/UPDATE_STATE', { key: 'globalNavigation.width', value: v })
        });

        const save = () => {
            s.dispatch('editor/save');
        };

        const createTagValue = computed({
            get: () => s.state.editor.globalNavigation.tags.create.value,
            set: (v: string) => s.commit('editor/UPDATE_STATE', { key: 'globalNavigation.tags.create.value', value: v })
        });

        return {
            width,
            save,
            store: s
        };
    },
    components: { Resizable, GlobalNavigationTagsSection, GlobalNavigationNotebooksSection }
});
</script>
