import { computed, defineComponent, ref, watch } from "vue";
import Modal from "./Modal";
import _ from "lodash";
import { useCommandConsole } from "@/hooks/vuex";
import { isBlank } from "@/utils";
import { Form, Field } from "vee-validate";

export default defineComponent({
  setup(p, c) {
    /*
     * Command console component will call actions directly instead of commands.
     */

    const commandConsole = useCommandConsole();

    const input = computed({
      get: () => commandConsole.state.input,
      set: (v: string) => commandConsole.actions.setInput(v),
    });

    const isActive = computed({
      get: () => commandConsole.state.modalActive ?? false,
      set: (v: boolean) => commandConsole.commit("SET_ACTIVE", v),
    });

    /*
     * If the user provides an input, assume we should make it harder to exit the modal so they don't
     * accidentally lose their place.
     */
    const focusTrap = computed(() => (!isBlank(input.value) ? "hard" : "soft"));

    const onItemClick = () => commandConsole.actions.selectAndRun();

    const onSubmit = () => {
      commandConsole.actions.selectAndRun();
    };

    return () => (
      <Modal
        focusTrap={focusTrap.value}
        v-models={[[isActive.value, "isActive"]]}
      >
        <Form onSubmit={onSubmit}>
          <Field name="Command" v-models={[[input.value, "modelValue"]]} />
        </Form>
      </Modal>
    );
  },
});

/* <div class="is-flex is-flex-column">
          <template v-if="suggestions.length > 1">
            <a
            :class="['has-text-dark py-1 has-background-hover-light', {'has-background-light': selectedIndex === i }
            ]"
              v-for="(suggestion, i) in suggestions" :key="i" @click="onItemClick(suggestion)"
            >
            {{ suggestion }}
            </a>
          </template>
          <div class="is-flex is-align-center py-2" v-else>
            Press enter to run...
          </div>
        </div>
      </div> */
