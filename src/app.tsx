import { defineComponent, onMounted, PropType } from "vue";
import "bulma"
import "@fortawesome/fontawesome-free"

export default defineComponent({
  props: {
    message: [String, Function] as PropType<string | (() => string)>,
  },
  setup(props) {
    return () => {
      return (
        <div id="app">
          <router-view />
        </div>
      );
    };
  },
});