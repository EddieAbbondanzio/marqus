import { defineComponent, onMounted } from "vue";
import { promptUser } from "./utils";

export default defineComponent({
  setup() {
    onMounted(() => {
      // promptUser({
      //   buttons: [{text: "Yes", role: "cancel"}],
      //   text: "hi"
      // })
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