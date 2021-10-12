import { defineComponent } from "vue";
import CommandConsole from "@/components/CommandConsole";

export default defineComponent({
  setup() {
    return () => (
      <div class="is-flex is-flex-row has-h-100">
        <CommandConsole />
        {/* <GlobalNavigation /> */}
        {/* <LocalNavigation  /> */}
        {/* <Editor /> */}
      </div>
    );
  },
});
