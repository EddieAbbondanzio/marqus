import { defineComponent, onMounted, PropType } from "vue";

export default defineComponent({
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