import { defineComponent, PropType } from "vue";

export default defineComponent({
  props: {
    message: [String, Function] as PropType<string | (() => string)>,
  },
  setup(props) {
    return () => {
      const message = props.message;
      return (
        <div id="app">
          YOUR AD HERE
        </div>
      );
    };
  },
});