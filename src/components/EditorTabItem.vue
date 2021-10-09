<template>
    <li
        :key="modelValue.id"
        :class="isTabActive(modelValue.id) ? 'editor-tab is-active' : 'editor-tab'"
        :title="noteName(modelValue.noteId)"
        :data-index="index"
    >
        <a
            class="is-flex is-flex-row is-justify-space-between is-align-center px-2"
            v-mouse:click.left="onClick"
            v-mouse:hold.left="onMoveStart"
            v-mouse:release.left="onMoveEnd"
        >
            <span :class="{ 'editor-tab-label': true, 'mr-1': true, 'is-italic': modelValue.state === 'preview' }"
                >{{ noteName(modelValue.noteId) }}{{ modelValue.state === 'dirty' ? '*' : '' }}</span
            >

            <DeleteButton title="Close" @click.stop="closeTab(modelValue.id)" />
        </a>
    </li>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import DeleteButton from "@/components/buttons/DeleteButton.vue";
import { useEditor } from "@/store/modules/ui/modules/editor";
import { Tab } from "@/store/modules/ui/modules/editor/state";
import { findParent } from "@/utils";

export default defineComponent({
  props: {
    modelValue: Object,
    index: Number
  },
  setup: (p) => {
    const editor = useEditor();

    const onClick = () => editor.actions.openTab(p.modelValue!.noteId);

    const onMoveStart = () => editor.actions.tabDragStart(p.modelValue as Tab);

    const onMoveEnd = (e: MouseEvent) => {
      const endedOnElement: HTMLElement | null = document.elementFromPoint(e.x, e.y) as HTMLElement | null;

      if (endedOnElement == null) {
        editor.actions.tabDragCancel();
        return;
      }

      const tabContainer = findParent(endedOnElement, (e) => e.id === "editor-tabs",
        { matchValue: e => e });

      // If we can't find the tab container, we didn't finish our drag within it. Stop.
      if (tabContainer == null) {
        return;
      }

      const endedAtXPositioned = e.offsetX;
      const tabs = document.querySelectorAll("#editor-tabs .editor-tab");

      let tabIndex = 0;
      let tabXPosition = 0;

      // Find the index of the last tab to the left of the drag end position based off local x coordinate.
      while (tabXPosition < endedAtXPositioned && tabs.length > tabIndex) {
        const tab = tabs.item(tabIndex) as HTMLElement;
        const box = tab.getBoundingClientRect();

        tabXPosition += box.width;
        tabIndex++;
      }

      // Gotta minus 1 since the loop incremented preemptively.
      tabIndex--;

      editor.actions.tabDragStop(tabIndex);
    };

    return {
      onClick,
      onMoveStart,
      onMoveEnd,
      closeTab: editor.actions.closeTab,
      tabs: computed(() => editor.state.tabs),
      noteName: editor.getters.noteName,
      isTabActive: editor.getters.isTabActive
    };
  },
  components: { DeleteButton }
});
</script>

<style lang="sass" scoped>
.editor-tab-label
    max-width: 120px
    overflow: hidden
    text-overflow: ellipsis
</style>
