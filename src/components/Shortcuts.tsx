<template>
  <span class="is-hidden">&nbsp;</span>
</template>

<script lang="ts">
/* eslint-disable max-len */

import { store } from "@/store";
import { shortcuts } from "@/store/modules/shortcuts";
import { defineComponent, onBeforeUnmount, onMounted } from "vue";
import { DEFAULT_SHORTCUTS } from "@/store/modules/shortcuts/default-shortcuts";

export default defineComponent({
  setup() {
    onMounted(() => {
      const ctx = shortcuts.context(store);

      const onKeyDown = (e:KeyboardEvent) => { ctx.actions.keyDown(e); };
      const onKeyUp = (e:KeyboardEvent) => { ctx.actions.keyUp(e); };

      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);

      ctx.actions.default(DEFAULT_SHORTCUTS);

      // Intentionally nested
      onBeforeUnmount(() => {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
      });
    });
  }
});
</script>
