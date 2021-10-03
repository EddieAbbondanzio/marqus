<template>
    <!-- Normal rendering -->
    <NavigationMenuItem
        v-if="!isNotebookBeingUpdated(modelValue.id)"
        :label="modelValue.name"
        :active="isActive({ id: modelValue.id, section: 'notebook' })"
        :highlight="isHighlighted({ id: modelValue.id, section: 'notebook' })"
        :expanded="modelValue.expanded"
        @update:expanded="(v) => (expanded = v)"
        :hideToggle="modelValue.children == null && !isNotebookBeingCreated(modelValue.id)"
        class="global-navigation-notebook"
        :data-id="modelValue.id"
        :indent="indentation(depth - 1)"
        v-mouse:click.left="() => setActive({ id: modelValue.id, section: 'notebook' })"
        v-mouse:hold.left="onHold"
        v-mouse:drag.left="onHover"
        v-mouse:dragcancel.left="() => notebookDragCancel()"
        v-mouse:release.left="onRelease"
    >
        <NavigationMenuForm
            v-if="isNotebookBeingCreated(modelValue.id)"
            @submit="confirm"
            @cancel="cancel"
            v-model="input"
            fieldName="Notebook"
            :rules="formRules"
            :indent="indentation(depth + 1)"
        />

        <template v-for="child in modelValue.children" :key="child.id">
            <GlobalNavigationNotebook :modelValue="child" :depth="depth + 1" />
        </template>
    </NavigationMenuItem>
    <!-- Edit rendering of notebook -->
    <NavigationMenuForm
        v-else
        @submit="confirm"
        @cancel="cancel"
        v-model="input"
        fieldName="Notebook"
        :rules="formRules"
        :indent="indentation(depth)"
    >
        <template v-for="child in modelValue.children" :key="child.id">
            <GlobalNavigationNotebook :modelValue="child" :depth="depth + 1" />
        </template>
    </NavigationMenuForm>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import NavigationMenuItem from "@/components/navigation/NavigationMenuItem.vue";
import NavigationMenuForm from "@/components/navigation/NavigationMenuForm.vue";
import { useNotebooks } from "@/store/modules/notebooks";
import { Notebook } from "@/store/modules/notebooks/state";
import { useGlobalNavigation } from "@/store/modules/ui/modules/global-navigation";
import { findParent } from "@/utils";

export default defineComponent({
  props: {
    modelValue: Object,
    depth: {
      type: Number,
      default: 1
    }
  },
  name: "GlobalNavigationNotebook",
  setup: function (p) {
    const globalNav = useGlobalNavigation();
    const notebooks = useNotebooks();

    const expanded = computed({
      get: () => p.modelValue!.expanded,
      set: (v: any) =>
        notebooks.actions.setExpanded({
          notebook: p.modelValue as any,
          expanded: v,
          bubbleUp: false
        })
    });

    const input = computed({
      get: () => globalNav.state.notebooks.input!.name,
      set: globalNav.actions.notebookInputUpdated
    });

    const onHold = () => globalNav.actions.notebookDragStart(p.modelValue as any);

    const onRelease = (ev: any) => {
      const src = document.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement;

      /**
             * Try to find the id of the notebook we ended on. We may need to climb the DOM
             * as target could be a nested element inside of NavigationMenuItem.
             */
      const id = findParent(src, (el) => el.classList.contains("global-navigation-notebook") &&
      el.hasAttribute("data-id"),
      { matchValue: (el) => el.getAttribute("data-id") });

      globalNav.actions.notebookDragStop(id);
    };

    const onHover = (ev: any) => {
      const src = document.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement;

      // Get the other notebook we dragged over
      const id = findParent(src, el => el.classList.contains("global-navigation-notebook") &&
       el.hasAttribute("data-id"),
      { matchValue: (el) => el.getAttribute("data-id") });

      if (id == null) {
        return;
      }

      const otherNotebook: Notebook | undefined = notebooks.getters.byId(id);

      if (otherNotebook == null) {
        return;
      }

      if (globalNav.state.notebooks.dragging && !otherNotebook.expanded) {
        notebooks.actions.setExpanded({
          notebook: otherNotebook,
          expanded: true,
          bubbleUp: false
        });
      }
    };

    const formRules = {
      required: true,
      unique: [
        () => {
          switch (globalNav.state.notebooks.input?.mode) {
          case "update":
            return p.modelValue!.parent == null
              ? notebooks.state.values
              : p.modelValue!.parent.children;

          case "create":
            return p.modelValue!.children ?? [];

          default:
            throw Error();
          }
        },
        (n: Notebook) => n.id,
        (n: Notebook) => n.name,
        () => globalNav.state.notebooks.input
      ]
    };

    return {
      expanded,
      input,
      onHold,
      onRelease,
      onHover,
      formRules,
      isNotebookBeingUpdated: computed(() => globalNav.getters.isNotebookBeingUpdated),
      isNotebookBeingCreated: computed(() => globalNav.getters.isNotebookBeingCreated),
      indentation: computed(() => globalNav.getters.indentation),
      canNotebookBeCollapsed: computed(() => globalNav.getters.canNotebookBeCollapsed),
      isActive: computed(() => globalNav.getters.isActive),
      confirm: computed(() => globalNav.actions.notebookInputConfirm),
      cancel: computed(() => globalNav.actions.notebookInputCancel),
      setActive: globalNav.actions.setActive,
      notebookDragCancel: globalNav.actions.notebookDragCancel,
      isHighlighted: computed(() => globalNav.getters.isSelected)
    };
  },
  components: { NavigationMenuForm, NavigationMenuItem }
});
</script>
