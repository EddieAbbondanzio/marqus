import { findParent } from "@/utils";
import { computed, defineComponent, onBeforeUnmount, onMounted } from "vue";

export default defineComponent({
  props: {
    isActive: {
      type: Boolean,
      required: false,
    },
    focusTrap: {
      type: String,
      default: "soft", // Can also be "hard"
    },
    foo: {
      type: Boolean,
    },
  },
  emits: ["update:isActive", "test"],
  setup(p, c) {
    const _isActive = computed({
      get: () => p.isActive,
      set: (val) => c.emit("update:isActive", val),
    });

    const onClick = ({ target }: MouseEvent) => {
      // It's easier to determine if we clicked within the modal than outside.
      const wasWithinModal = findParent(target as HTMLElement, (el) =>
        el.classList.contains("modal-content")
      );

      // Only allow click outside to close if focus trap is set to soft
      if (!wasWithinModal && p.focusTrap === "soft") {
        _isActive.value = false;
        console.log("HIDE IT!");
      }
    };

    onMounted(() => {
      window.addEventListener("click", onClick);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("click", onClick);
    });

    const classes = computed(() => [
      "modal",
      { "is-active": _isActive.value, "is-clipped": _isActive.value },
    ]);

    return () => {
      return (
        <div class={classes.value}>
          <div class="modal-background is-flex is-align-center">
            <div class="modal-content box">
              {c.slots.default != null ? c.slots.default() : null}
            </div>
          </div>
        </div>
      );
    };
  },
});
