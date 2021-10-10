import { CreateTag } from "@/commands/globalNavigation";
import { confirmDelete } from "@/prompts";
import { store } from "@/store";
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
