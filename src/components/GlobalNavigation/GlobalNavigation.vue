<template>
    <resizable class="has-text-dark" v-model="width" data-context-menu="globalNavigation">
        <ul>
            <li :class="['has-background-hover-light', { 'has-background-light': active === 'all' }]">
                <a class="no-drag has-text-grey is-size-7 is-uppercase" @click="() => (active = 'all')">
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
                <a class="no-drag has-text-grey is-size-7 is-uppercase" @click="() => (active = 'favorites')">
                    <div class="has-background-transparent">
                        <span class="icon">
                            <i class="fas fa-star"></i>
                        </span>
                        <span>Favorites</span>
                    </div>
                </a>
            </li>
            <li :class="['has-background-hover-light', { 'has-background-light': active === 'trash' }]">
                <a class="no-drag has-text-grey is-size-7 is-uppercase" @click="() => (active = 'trash')">
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
            get: () => s.state.app.globalNavigation.width as string,
            set: (w: any) => {
                s.commit('app/globalNavigation/WIDTH', w);
                s.commit('DIRTY', null, { root: true });
            }
        });

        const active = computed({
            get: () => s.state.app.globalNavigation.active,
            set: (v: any) => {
                s.commit('app/globalNavigation/ACTIVE', v);
                s.commit('DIRTY', null, { root: true });
            }
        });

        return {
            width,
            active
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
