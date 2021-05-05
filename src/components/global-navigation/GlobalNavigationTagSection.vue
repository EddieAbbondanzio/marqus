<template>
    <NavigationMenuItem
        id="global-navigation-tag-section"
        icon="tag"
        label="TAGS"
        v-model:expanded="expanded"
        :toggleAnywhere="true"
    >
        <NavigationMenuForm
            id="global-navigation-tag-create-form"
            v-if="isTagBeingCreated"
            @submit="confirm"
            @cancel="cancel"
            v-model="input"
            fieldName="Tag"
            :rules="formRules"
        />

        <!-- Renderless v-for  -->
        <template v-for="tag in tags" :key="tag.id">
            <NavigationMenuItem
                v-if="!isTagBeingUpdated(tag.id)"
                :label="tag.value"
                :active="isActive({ id: tag.id, type: 'tag' })"
                @click="() => setActive({ id: tag.id, type: 'tag' })"
                :data-id="tag.id"
                class="global-navigation-tag"
            />
            <NavigationMenuForm
                v-else
                @submit="confirm"
                @cancel="cancel"
                v-model="input"
                fieldName="Tag"
                :rules="formRules"
            />
        </template>
    </NavigationMenuItem>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { mapActions, mapGetters, mapState, useStore } from 'vuex';
import NavigationMenuItem from '@/components/core/navigation/NavigationMenuItem.vue';
import NavigationMenuForm from '@/components/core/navigation/NavigationMenuForm.vue';
import { Tag } from '@/store/modules/tags/state';

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

        const formRules = {
            required: true,
            unique: [
                () => s.state.tags.values,
                (t: Tag) => t.id,
                (t: Tag) => t.value,
                () => s.state.app.globalNavigation.tags.input
            ]
        };

        return {
            expanded,
            input,
            formRules
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
    components: { NavigationMenuItem, NavigationMenuForm }
});
</script>
