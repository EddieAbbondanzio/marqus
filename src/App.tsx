import { defineComponent, onMounted } from "vue";
import { PromptUser } from "./_electron";

declare global {
  interface Window {
    promptUser: PromptUser;
  }
}

export default defineComponent({
  setup() {
    onMounted(async () => {
      const res = await window.promptUser({
        buttons: [{text: "Yes", role: "cancel"}, ],
        text: "hi"
      })
      console.log("button selected: ", res)
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