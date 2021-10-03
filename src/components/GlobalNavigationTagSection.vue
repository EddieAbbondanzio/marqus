<template>
    <NavigationMenuItem
        id="global-navigation-tag-section"
        icon="tag"
        label="TAGS"
        :title="count"
        v-model:expanded="expanded"
        :active="isActive({ section: 'tag' })"
        :highlight="isHighlighted({ section: 'tag' })"
        @click="() => setActive({ section: 'tag' })"
    >
        <template #options>
            <IconButton
                :disabled="isTagBeingCreated"
                icon="fa-plus"
                class="has-text-grey is-size-7 has-text-hover-success"
                @click.prevent.stop="() => createTag()"
                title="Create new tag"
            />
        </template>

        <NavigationMenuForm
            id="global-navigation-tag-create-form"
            v-if="isTagBeingCreated"
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
                :label="tag.name"
                :active="isActive({ id: tag.id, section: 'tag' })"
                :highlight="isHighlighted({ id: tag.id, section: 'tag' })"
                @click.stop="() => setActive({ id: tag.id, section: 'tag' })"
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
import { computed, defineComponent } from "vue";
import NavigationMenuItem from "@/components/navigation/NavigationMenuItem.vue";
import NavigationMenuForm from "@/components/navigation/NavigationMenuForm.vue";
import IconButton from "@/components/buttons/IconButton.vue";
import { useTagValidation } from "@/hooks/use-tag-validation";
import { useTags } from "@/store/modules/tags";
import { useGlobalNavigation } from "@/store/modules/ui/modules/global-navigation";
import { commands } from "@/commands";

export default defineComponent({
  setup: function () {
    const globalNav = useGlobalNavigation();
    const tags = useTags();

    const expanded = computed({
      get: () => globalNav.state.tags.expanded,
      set: (v: any) => {
        globalNav.dispatch("setTagsExpanded", v);
      }
    });

    const input = computed({
      get: () => globalNav.state.tags.input!.name,
      set: (v: string) => {
        globalNav.dispatch("tagInputUpdated", v);
      }
    });

    const formRules = useTagValidation(() => globalNav.state.tags.input);

    const createTag = () => {
      commands.run("globalNavigationCreateTag");
    };

    return {
      expanded,
      input,
      formRules,
      tags: computed(() => tags.state.values),
      confirm: globalNav.actions.tagInputConfirm,
      cancel: globalNav.actions.tagInputCancel,
      setActive: globalNav.actions.setActive,
      createTag,
      // createTag: globalNav.actions.tagInputStart,
      isTagBeingUpdated: computed(() => globalNav.getters.isTagBeingUpdated),
      isTagBeingCreated: computed(() => globalNav.getters.isTagBeingCreated),
      indentation: computed(() => globalNav.getters.indentation),
      isActive: computed(() => globalNav.getters.isActive),
      isHighlighted: computed(() => globalNav.getters.isSelected),
      count: computed(() => `${tags.getters.count} ${tags.getters.count === 1 ? "tag" : "tags"}`)
    };
  },
  components: { NavigationMenuItem, NavigationMenuForm, IconButton }
});
</script>
