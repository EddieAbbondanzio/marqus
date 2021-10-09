import { defineComponent, PropType } from "vue";
import HelloWorld from "./components/HelloWorld.vue";

export default defineComponent({
  props: {
    message: [String, Function] as PropType<string | (() => string)>,
  },
  setup(props) {
    return () => {
      const message = props.message;
      return (
        <div id="app">
          <img alt="Vue logo" src="./assets/logo.png" width="25%" />
          HI
        </div>
      );
    };
  },
});