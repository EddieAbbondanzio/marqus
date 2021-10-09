import { defineComponent, PropType } from "vue";

export default defineComponent({
  props: {
    message: [String, Function] as PropType<string | (() => string)>,
  },
  setup(props) {
    return () => {
      const message = props.message;
      return (
        <div class="is-flex is-flex-row has-h-100">
          hi
        {/* <CommandConsole />
        <GlobalNavigation />
        <LocalNavigation />
        <Editor /> */}
    </div>
      );
    };
  },
});