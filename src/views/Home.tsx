import { confirmDelete } from "@/prompts";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  setup() {
    onMounted(async () => {
      // const res = await window.promptUser({text: "Are you sure?", buttons: [{text: "Yes", role: "default"}]});
      // console.log('res: ', res);
    });

    return () => {
      return <div>Content here!</div>;
    };
  },
});
