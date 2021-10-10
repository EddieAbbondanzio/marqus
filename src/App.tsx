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
    onMounted(async () => {
     const files = await window.fileSystem.readDirectory("/")
     console.log(files);
     
      // const res = await window.promptUser({
        // buttons: [{text: "Yes", role: "cancel"}, ],
        // text: "hi"
      // })
      // console.log("button selected: ", res)
    });

    return () => {
      return (
        <div id="app">
          <router-view />
        </div>
      );
    };
  },
});