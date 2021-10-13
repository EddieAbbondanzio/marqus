import { defineComponent, onBeforeUnmount, onMounted } from "vue";
import Cursor from "@/components/Cursor";
import Shortcuts from "@/components/Shortcuts";
import { findParent } from "./utils";
import { FOCUSABLE_ATTRIBUTE } from "./store/modules/ui/actions";
import { useUserInterface } from "./hooks/vuex";

export default defineComponent({
  setup() {
    const ui = useUserInterface();

    /**
     * Keep track of the actively focused element.
     */
    function onFocusIn(event: FocusEvent) {
      // We might need to climb up the dom tree to handle nested children of a scope.
      const scopeEl = findParent(
        event.target as HTMLElement,
        (el) => el.hasAttribute(FOCUSABLE_ATTRIBUTE),
        { matchValue: (el) => el }
      );

      if (scopeEl == null) {
        ui.actions.blurFocused();
      } else {
        const id = scopeEl.getAttribute(FOCUSABLE_ATTRIBUTE)!;
        ui.actions.focus({ id });
      }
    }

    onMounted(() => {
      window.addEventListener("focusin", onFocusIn);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("focusin", onFocusIn);
    });

    return () => (
      <div id="app">
        <Cursor />
        <Shortcuts />

        <router-view />
      </div>
    );
  },
});
