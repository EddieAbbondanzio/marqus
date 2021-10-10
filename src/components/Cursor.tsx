import { computed, defineComponent, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  setup() {
    const CURSOR_DRAGGING_ID = "cursor-dragging";
    const s = useStore();
    let cursorClass = "has-cursor-default";

    const release = s.subscribe((m) => {
      switch (m.type) {
        case "ui/SET_CURSOR_ICON":
          // Remove old one first
          document.body.classList.remove(cursorClass);

          cursorClass = `has-cursor-${m.payload}`;
          document.body.classList.add(cursorClass);
          break;

        case "ui/RESET_CURSOR_ICON":
          // Remove old one first
          document.body.classList.remove(cursorClass);

          cursorClass = "has-cursor-default";
          document.body.classList.add(cursorClass);
          break;
      }
    });

    const calculateCursorDraggingPosition = (e: MouseEvent) => {
      if (!(s.state?.ui?.cursor?.dragging ?? false)) return;

      const div = document.getElementById("cursor-dragging")!;

      div.style.left = `${e.pageX}px`;
      div.style.top = `${e.pageY - 20}px`;
    };

    onMounted(function () {
      document.addEventListener("mousemove", calculateCursorDraggingPosition);
    });

    onUnmounted(function () {
      release();
      document.removeEventListener(
        "mousemove",
        calculateCursorDraggingPosition
      );
    });

    const isDragging = computed(() => s.state?.ui?.cursor?.dragging ?? false);

    return () => (
      <div
        id={CURSOR_DRAGGING_ID}
        class="is-absolute is-size-7"
        v-show={isDragging}
      >
        &nbsp;
      </div>
    );
  },
});
