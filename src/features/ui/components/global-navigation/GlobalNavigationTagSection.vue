<template>
    <NavigationMenuItem
        id="global-navigation-tag-section"
        icon="tag"
        label="TAGS"
        v-model:expanded="expanded"
        :toggleAnywhere="true"
    >
        <template #options>
            <IconButton
                icon="fa-plus"
                class="has-text-grey is-size-7 has-text-hover-success"
                @click.prevent.stop="() => createTag()"
                title="Create new tag"
            />
        </template>

        <NavigationMenuForm
            id="global-navigation-tag-create-form"
            v-if="isTagBeingCreated()"
            @submit="confirm"
            @cancel="cancel"
            v-model="input"
            fieldName="Tag"
            :rules="formRules"
            indent="24px"
        />

        <!-- Renderless v-for so we don't end up with a wrapper div -->
        <template v-for="tag in tags" :key="tag.id">
            <NavigationMenuItem
                v-if="!isTagBeingUpdated(tag.id)"
                :label="tag.value"
                :active="isActive({ id: tag.id, type: 'tag' })"
                @click="() => setActive({ id: tag.id, section: 'tag' })"
                :data-id="tag.id"
                class="global-navigation-tag"
            >
            </NavigationMenuItem>
            <NavigationMenuForm
                v-else
                @submit="confirm"
                @cancel="cancel"
                v-model="input"
                fieldName="Tag"
                :rules="formRules"
                indent="24px"
            />
        </template>
    </NavigationMenuItem>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { mapActions, mapGetters, mapState, useStore } from 'vuex';
import NavigationMenuItem from '@/components/navigation/NavigationMenuItem.vue';
import NavigationMenuForm from '@/components/navigation/NavigationMenuForm.vue';
import IconButton from '@/components/IconButton.vue';
import { Tag } from '@/features/tags/common/tag';
import { useGlobalNavigation } from '@/features/ui/store/modules/global-navigation';
import * as _ from 'lodash';
import { Context } from 'vuex-smart-module';

export default defineComponent({
    setup: function() {
        const s = useStore();
        const globalNav = useGlobalNavigation();

        const expanded = computed({
            get: () => globalNav.state.tags.expanded,
            set: (v: any) => globalNav.dispatch('setTagsExpanded', v)
        });

        const input = computed({
            get: () => globalNav.state.tags.input!.value,
            set: (v: string) => globalNav.dispatch('tagInputUpdated', v)
        });

        const formRules = {
            required: true,
            unique: [
                () => s.state.tags.values,
                (t: Tag) => t?.id,
                (t: Tag) => t?.value,
                () => globalNav.state.tags.input
            ]
        };

        const tags = computed(() => s.state.tags.values);

        return {
            expanded,
            input,
            formRules,
            tags,
            confirm: globalNav.actions.tagInputConfirm,
            cancel: globalNav.actions.tagInputCancel,
            setActive: globalNav.actions.setActive,
            createTag: globalNav.actions.tagInputStart,
            isTagBeingUpdated: globalNav.getters.isTagBeingUpdated,
            isTagBeingCreated: globalNav.getters.isTagBeingCreated,
            indentation: globalNav.getters.indentation,
            isActive: globalNav.getters.isActive
        };
    },
    components: { NavigationMenuItem, NavigationMenuForm, IconButton }
});
</script>
