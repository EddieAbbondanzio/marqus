import { computed, defineComponent, ref, watch } from "vue";
import Modal from "./Modal";
import { useStore } from "vuex";
import _ from "lodash";
import { commands } from "@/commands";
import { globalNavigation } from "@/store/modules/ui/modules/globalNavigation";
import { confirmDelete } from "@/prompts";

export default defineComponent({
  setup() {
    /*
     * Command console should not run commands directly. Instead have it call the lower layer actions.
     */

    const ctx = globalNavigation;

    // const cc = commandConsole.context(store);

    // const input = computed({
    //   get() {
    //     return commandConsole.state.input;
    //   },
    //   set(v: string) {
    //     commandConsole.actions.setInput(v);
    //   },
    // });

    // const onSubmit = () => commandConsole.actions.selectAndRun();

    /*
     * If the user provides an input, assume we should make it harder to exit the modal so they don't
     * accidentally lose their place.
     */
    // const focusTrap = computed(() => (!isBlank(input.value) ? "hard" : "soft"));

    let isActive = ref(true);

    // const onItemClick = () => commandConsole.actions.selectAndRun();
    const onUpdateModelValue = () => console.log("hi");

    return () => (
      <Modal focusTrap="soft" v-models={[[isActive.value, "isActive"]]}>
        <div class="has-text-danger">OF COURSE!</div>
      </Modal>
    );
    {
      /* 
    //     <Form @submit="onSubmit">
    //         <InputField label="Command" :hideLabel="true" v-model="input" v-slot="{ field }">
    //           <input class="input" v-bind="field" placeholder="Type to run command..." v-context:commandConsole />
    //         </InputField>
    //     </Form>

    //     <!-- Suggestions -->
    //     <div class="is-flex is-flex-column">
    //       <template v-if="suggestions.length > 1">
    //         <a
    //         :class="['has-text-dark py-1 has-background-hover-light', {'has-background-light': selectedIndex === i }
    //         ]"
    //           v-for="(suggestion, i) in suggestions" :key="i" @click="onItemClick(suggestion)"
    //         >
    //         {{ suggestion }}
    //         </a>
    //       </template>
    //       <div class="is-flex is-align-center py-2" v-else>
    //         Press enter to run...
    //       </div>
    //     </div>
    //   </div>
    // </modal>
    // ; */
    }

    // return {
    //
  },
});
