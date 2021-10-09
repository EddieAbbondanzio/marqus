import { defineComponent, onMounted, PropType } from "vue";
import { ipcRenderer } from "./utils/ipcRenderer";

export default defineComponent({
  props: {
    message: [String, Function] as PropType<string | (() => string)>,
  },
  setup(props) {
    onMounted(() => {
      console.log(ipcRenderer)
    });

    return () => {
      const message = props.message;
      return (
        <div id="app">
          <router-view />
        </div>
      );
    };
  },
});