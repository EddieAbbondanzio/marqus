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
import { findParent } from "@/utils";
import { computed, defineComponent, onBeforeUnmount, onMounted } from "vue";

export default defineComponent({
  setup(p, c) {
    const _isActive = computed({
      get: () => p.isActive ?? false,
      set: (val) => {
        c.emit("update:modelValue", val);
      }
    });

    const onClick = ({ target }: MouseEvent) => {
      const wasBackgroundClick = findParent(target as HTMLElement, el => el.classList.contains("modal-background"));

      if (wasBackgroundClick && p.focusTrap === "soft") {
        _isActive.value = false;
      }
    };

    onMounted(() => {
      window.addEventListener("click", onClick);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("click", onClick);
    });

    return {
      classes: computed(() => ["modal", { "is-active": _isActive.value }])
    };
  },
  props: {
    isActive: {
      type: Boolean,
      required: false
    },
    focusTrap: {
      type: String,
      default: "soft" // Can also be "hard"
    }
  },
  emits: ["update:modelValue"]
});
</script>

<style lang="sass" scoped>
.modal-background
  color: red!important
</style>
