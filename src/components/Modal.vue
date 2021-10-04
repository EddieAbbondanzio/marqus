<template>
<div :class="classes">
    <div class="modal-background">
        <div class="modal-content">
        <slot>hi</slot>
        </div>
    </div>
</div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";

export default defineComponent({
  setup(p, c) {
    const _isActive = computed({
      get: () => p.isActive ?? false,
      set: (val) => {
        c.emit("update:modelValue", val);
      }
    });

    return {
      classes: computed(() => ["modal", { "is-active": _isActive.value }])
    };
  },
  props: {
    isActive: {
      type: Boolean,
      required: false
    }
  },
  emits: ["update:modelValue"]
});
</script>

<style lang="sass" scoped>
.modal-background
  color: red!important
</style>
