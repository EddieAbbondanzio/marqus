<template>
    <NavigationMenuItem icon="tag" label="TAGS" v-model:expanded="expanded">
        <GlobalNavigationTagForm v-if="isTagBeingCreated" @submit="confirm" @cancel="cancel" v-model="input" />

        <NavigationMenuItem
            v-for="tag in tags"
            :key="tag.id"
            :label="tag.value"
            :active="isActive({ id: tag.id, type: 'tag' })"
            @click="() => setActive({ id: tag.id, type: 'tag' })"
        />
    </NavigationMenuItem>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { mapActions, mapGetters, mapState, useStore } from 'vuex';
import GlobalNavigationTagForm from '@/components/global-navigation/GlobalNavigationTagForm.vue';
import NavigationMenuItem from '@/components/core/navigation/NavigationMenuItem.vue';

export default defineComponent({
    setup: function() {
        const s = useStore();

        const expanded = computed({
            get: () => s.state.app.globalNavigation.tags.expanded,
            set: (v: any) => {
                s.commit('app/globalNavigation/TAGS_EXPANDED', v);
            }
        });

        const input = computed({
            get: () => s.state.app.globalNavigation.tags.input.value,
            set: (v: string) => s.commit('app/globalNavigation/TAG_INPUT_VALUE', v)
        });

        return {
            expanded,
            input
        };
    },
    computed: {
        ...mapState('tags', {
            tags: (state: any) => state.values
        }),
        ...mapGetters('app/globalNavigation', ['isTagBeingUpdated', 'isTagBeingCreated', 'indentation', 'isActive'])
    },
    methods: {
        ...mapActions('app/globalNavigation', {
            confirm: 'tagInputConfirm',
            cancel: 'tagInputCancel',
            setActive: 'setActive'
        })
    },
    components: { GlobalNavigationTagForm, NavigationMenuItem }
});
</script>

<style lang="sass">
.global-navigation-tag
    padding-left: 24px;
</style>
