<template>
    <resizable v-model="width" @resizeStop="save">
        <div class="has-h-100 has-text-dark">
            <!-- Header -->
            <div
                class="is-flex is-flex-grow-1 is-justify-space-between is-align-center has-border-bottom-1-dark p-1 has-background-light"
            >
                <local-navigation-search-bar />
                <icon-button icon="fa-plus" size="is-small" />
            </div>

            <!-- Files -->
        </div>
    </resizable>
</template>

<script lang="ts">
import { computed, defineComponent, ref, WritableComputedRef } from 'vue';
import Resizable from '@/components/Resizable.vue';
import IconButton from '@/components/IconButton.vue';
import LocalNavigationSearchBar from '@/components/LocalNavigation/LocalNavigationSearchBar.vue';
import { useStore } from 'vuex';

export default defineComponent({
    setup: function() {
        const s = useStore();

        const width = computed({
            get: () => s.state.app.localNavigation.width as string,
            set: (v: any) => s.commit('app/UPDATE_STATE', { key: 'localNavigation.width', value: v })
        });

        const save = () => s.dispatch('save');

        return {
            width,
            save
        };
    },
    components: { Resizable, LocalNavigationSearchBar, IconButton }
});
</script>
