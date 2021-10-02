<template>
  <span class="is-hidden">&nbsp;</span>
</template>

<script lang="ts">
/* eslint-disable max-len */

import { store } from "@/store";
import { shortcuts } from "@/store/modules/shortcuts";
import { GENERAL_USE_SHORTCUTS, ShortcutRaw } from "@/store/modules/shortcuts/state";
import { GLOBAL_NAVIGATION_SHORTCUTS, GlobalNavigationCommand } from "@/store/modules/ui/modules/global-navigation";
import { defineComponent, onBeforeUnmount, onMounted } from "vue";

export default defineComponent({
  setup() {
    onMounted(() => {
      const ctx = shortcuts.context(store);

      const onKeyDown = (e:KeyboardEvent) => { ctx.actions.keyDown(e); };
      const onKeyUp = (e:KeyboardEvent) => { ctx.actions.keyUp(e); };

      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);

      const context = "globalNavigation";

      ctx.actions.default([
        { keys: GLOBAL_NAVIGATION_SHORTCUTS.focusGlobalNavigation, command: "focusGlobalNavigation" },
        { keys: GLOBAL_NAVIGATION_SHORTCUTS.globalNavigationCollapseAll, command: "globalNavigationCollapseAll", context },
        { keys: GLOBAL_NAVIGATION_SHORTCUTS.globalNavigationCreateTag, command: "globalNavigationCreateTag", context },
        { keys: GLOBAL_NAVIGATION_SHORTCUTS.globalNavigationExpandAll, command: "globalNavigationExpandAll", context },
        { keys: GENERAL_USE_SHORTCUTS.moveSelectionDown, command: "globalNavigationMoveSelectionDown", context },
        { keys: GENERAL_USE_SHORTCUTS.moveSelectionUp, command: "globalNavigationMoveSelectionUp", context },
        { keys: GENERAL_USE_SHORTCUTS.scrollDown, command: "globalNavigationScrollDown", context },
        { keys: GENERAL_USE_SHORTCUTS.scrollUp, command: "globalNavigationScrollUp", context }
      ] as ShortcutRaw<GlobalNavigationCommand>[]);

      // Intentionally nested
      onBeforeUnmount(() => {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
      });
    });
  }
});
</script>
