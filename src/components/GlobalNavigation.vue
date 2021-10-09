<template>
    <Resizable
        id="global-navigation"
        class="has-text-dark"
        v-model="width"
        minWidth="160px"
        v-context-menu:globalNavigation
        v-context:globalNavigation
    >
        <Scrollable v-model="scrollPosition">
            <NavigationMenuItem
                icon="file-alt"
                label="ALL"
                :active="isActive({ section: 'all' })"
                :highlight="isHighlighted({ section: 'all' })"
                @click="setActive({ section: 'all' })"
                :hideToggle="true"
            >
                <template #options>
                    <IconButton
                        icon="fa-angle-double-down"
                        class="has-text-grey"
                        size="is-size-7"
                        title="Expand all"
                        @click="expandAll()"
                    />
                    <IconButton
                        icon="fa-angle-double-up"
                        class="has-text-grey"
                        size="is-size-7"
                        title="Collapse all"
                        @click="collapseAll()"
                    />
                </template>
            </NavigationMenuItem>

            <GlobalNavigationNotebookSection />

            <GlobalNavigationTagSection />

            <NavigationMenuItem
                icon="star"
                label="FAVORITES"
                :active="isActive({ section: 'favorites' })"
                :highlight="isHighlighted({ section: 'favorites' })"
                @click="setActive({ section: 'favorites' })"
            />

            <NavigationMenuItem
                icon="trash"
                label="TRASH"
                :active="isActive({ section: 'trash' })"
                :highlight="isHighlighted({ section: 'trash' })"
                @click="setActive({ section: 'trash' })"
            />
        </Scrollable>
    </Resizable>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import Resizable from "@/components/layout/Resizable.vue";
import GlobalNavigationTagSection from "@/components/GlobalNavigationTagSection.vue";
import GlobalNavigationNotebookSection from "@/components/GlobalNavigationNotebookSection.vue";
import NavigationMenuItem from "@/components/navigation/NavigationMenuItem.vue";
import IconButton from "@/components/buttons/IconButton.vue";
import { useGlobalNavigationContextMenu } from "@/context-menus/global-navigation-context-menu";
import Scrollable from "@/components/layout/Scrollable.vue";
import { mapUndoRedo } from "@/store/plugins/undo/utils/map-undo-redo";
import { useGlobalNavigation } from "@/store/modules/ui/modules/global-navigation";

export default defineComponent({
  setup: function () {
    const globalNav = useGlobalNavigation();
    useGlobalNavigationContextMenu();

    const width = computed({
      get: () => globalNav.state.width as string,
      set: globalNav.actions.setWidth
    });

    const scrollPosition = computed({
      get: () => globalNav.state.scrollPosition,
      set: (v: any) => {
        globalNav.actions.setScrollPosition(v);
      }
    });

    return {
      width,
      scrollPosition,
      isActive: computed(() => globalNav.getters.isActive),
      isHighlighted: computed(() => globalNav.getters.isSelected),
      expandAll: globalNav.actions.expandAll,
      collapseAll: globalNav.actions.collapseAll,
      setActive: globalNav.actions.setActive,
      ...mapUndoRedo({ name: "globalNavigation" })
    };
  },
  components: {
    Resizable,
    GlobalNavigationTagSection,
    GlobalNavigationNotebookSection,
    NavigationMenuItem,
    IconButton,
    Scrollable
  }
});
</script>
