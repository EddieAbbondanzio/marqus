<template>
    <modal :isActive="modalActive" v-context:console>
      HI
    </modal>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import Modal from "@/components/Modal.vue";
import { useConsole } from "@/store/modules/ui/modules/console";

export default defineComponent({
  setup() {
    const console = useConsole();

    return {
      modalActive: computed(() => console.state.modalActive)
    };
  },
  components: { Modal }
});
</script>
