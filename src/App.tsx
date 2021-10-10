import { defineComponent, onMounted } from "vue";
import Cursor from "@/components/Cursor";
import Shortcuts from "@/components/Shortcuts";

export default defineComponent({
  setup() {
    return () => (
      <div id="app">
        <Cursor />
        <Shortcuts />

        <router-view />
      </div>
    );
  },
});
