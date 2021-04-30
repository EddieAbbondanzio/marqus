<template>
    <li class="has-text-grey is-size-7">
        <Collapse v-model="expanded" triggerClass="has-background-hover-light">
            <template #trigger>
                <div class="is-flex is-align-center global-navigation-title is-flex-grow-1 has-background-transparent">
                    <span class="icon">
                        <i class="fas fa-tag"></i>
                    </span>
                    <span class="is-size-7 is-uppercase">Tags</span>
                </div>
            </template>

            <GlobalNavigationTagForm v-if="isTagBeingCreated" @submit="confirm" @cancel="cancel" v-model="input" />

            <NavigationMenuList>
                <NavigationMenuItem
                    v-for="tag in tags"
                    :key="tag.id"
                    :label="tag.value"
                    :active="isActive(tag.id, 'tag')"
                    :indent="indentation(1)"
                    @click="() => setActive({ id: tag.id, type: 'tag' })"
                />
            </NavigationMenuList>
        </Collapse>
    </li>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { mapActions, mapGetters, mapState, useStore } from 'vuex';
import Collapse from '@/components/Collapse.vue';
import GlobalNavigationTagForm from '@/components/GlobalNavigation/GlobalNavigationTagForm.vue';
import NavigationMenuList from '@/components/Core/NavigationMenuList.vue';
import GlobalNavigation from './GlobalNavigation.vue';
import NavigationMenuItem from '@/components/Core/NavigationMenuItem.vue';

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
    components: { Collapse, GlobalNavigationTagForm, NavigationMenuItem, NavigationMenuList }
});
</script>

<style lang="sass">
.global-navigation-tag
    padding-left: 24px;
</style>
