<template>
    <resizable class="has-text-dark" v-model="width" @resizeStop="save" data-context-menu="globalNavigation">
        <ul>
            <li :class="['has-background-hover-light', { 'has-background-light': active === 'all' }]">
                <a class="has-text-grey is-size-7 is-uppercase" @click="() => (active = 'all')">
                    <div class="is-flex is-align-center has-background-transparent">
                        <span class="icon">
                            <i class="fas fa-file-alt"></i>
                        </span>
                        <span>All</span>
                    </div>
                </a>
            </li>

            <global-navigation-notebook-section />

            <global-navigation-tag-section />

            <li :class="['has-background-hover-light', { 'has-background-light': active === 'favorites' }]">
                <a class="has-text-grey is-size-7 is-uppercase" @click="() => (active = 'favorites')">
                    <div class="has-background-transparent">
                        <span class="icon">
                            <i class="fas fa-star"></i>
                        </span>
                        <span>Favorites</span>
                    </div>
                </a>
            </li>
            <li :class="['has-background-hover-light', { 'has-background-light': active === 'trash' }]">
                <a class="has-text-grey is-size-7 is-uppercase" @click="() => (active = 'trash')">
                    <div class="has-background-transparent">
                        <span class="icon">
                            <i class="fas fa-trash"></i>
                        </span>
                        <span>Trash</span>
                    </div>
                </a>
            </li>
        </ul>
    </resizable>
</template>

<script lang="ts">
import { computed, defineComponent, getCurrentInstance, ref, WritableComputedRef, provide, onMounted } from 'vue';
import Resizable from '@/components/Resizable.vue';
import { useStore } from 'vuex';
import GlobalNavigationTagSection from '@/components/GlobalNavigation/GlobalNavigationTagSection.vue';
import GlobalNavigationNotebookSection from '@/components/GlobalNavigation/GlobalNavigationNotebookSection.vue';

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

        const active = computed({
            get: () => s.state.editor.globalNavigation.active,
            set: (v: any) => s.commit('editor/UPDATE_STATE', { key: 'globalNavigation.active', value: v })
        });

        return {
            width,
            active,
            save,
            store: s
        };
    },
    components: { Resizable, GlobalNavigationTagSection, GlobalNavigationNotebookSection }
});
</script>

<style lang="sass">
global-navigation-title
    padding-top: 2px
    padding-bottom: 2px

.global-navigation-item
    line-height: 24px
</style>
