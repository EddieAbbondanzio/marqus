import { defineComponent, onMounted } from "vue";
import { commands } from "./commands";
import { shortcuts } from "./store/modules/shortcuts";
import Cursor from "@/components/Cursor";

export default defineComponent({
  setup() {
    return () => {
      return (
        <div id="app">
          <Cursor />

          <router-view />
        </div>
      );
    };
  },
});
