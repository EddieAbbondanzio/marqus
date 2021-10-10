import { defineComponent, onMounted } from "vue";
import { PromptUser } from "./_electron";
import { fileSystem } from "./_electron/renderer/fileSystem";

declare global {
  interface Window {
    promptUser: PromptUser;
    fileSystem: typeof fileSystem;
  }
}

export default defineComponent({
  setup() {
    return () => {
      return (
        <div id="app">
          <router-view />
        </div>
      );
    };
  },
});