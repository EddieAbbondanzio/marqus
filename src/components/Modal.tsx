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
      const wasBackgroundClick = findParent(target as HTMLElement, (el) =>
        el.classList.contains("modal-background")
      );

      // Only allow click outside to close if focus trap is set to soft
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

    const classes = computed(() => ["modal", { "is-active": _isActive.value }]);

    return () => {
      return (
        <div class={classes.value}>
          <div class="modal-background">
            <div class="modal-content">
              {c.slots.default != null ? c.slots.default() : null}
            </div>
          </div>
        </div>
      );
    };
  },
});
