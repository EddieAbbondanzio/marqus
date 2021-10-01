<template>
    <Cursor />
    <router-view></router-view>
</template>

<script lang="ts">
import { onBeforeUnmount, onMounted } from "vue";
import { useStore } from "vuex";
import Cursor from "@/components/Cursor.vue";
import { mediator } from "@/store/plugins/mediator/mediator";
import { persist } from "@/store/plugins/persist/persist";
import { shortcuts } from "./utils/shortcuts/shortcuts";
import { contexts } from "./utils";
import { mouseObjectPublisher } from "./directives/mouse";

export default {
  components: { Cursor },
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
      shortcuts.dispose();
    });
  }
};
</script>
