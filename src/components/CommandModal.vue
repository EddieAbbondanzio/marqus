<template>
    <modal :isActive="true"></modal>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Modal from "@/components/Modal.vue";

export default defineComponent({
  components: { Modal }
});
</script>
