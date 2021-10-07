<template>
    <Cursor />
    <Shortcuts />
    <router-view></router-view>
</template>

<script lang="ts">
import { onBeforeUnmount, onMounted } from "vue";
import { useStore } from "vuex";
import Cursor from "@/components/Cursor.vue";
import { mediator } from "@/store/plugins/mediator/mediator";
import { persist } from "@/store/plugins/persist";
import { mouseObjectPublisher } from "./directives/mouse";
import Shortcuts from "@/components/Shortcuts.vue";
import { contexts } from "./directives/context";

export default {
  components: { Cursor, Shortcuts },
  setup: () => {
    const s = useStore();

    onMounted(() => {
      persist.init(s);
    });

    onBeforeUnmount(() => {
      persist.release();
      mediator.release();

      contexts.dispose();
      mouseObjectPublisher.dispose();
    });
  }
};
</script>
