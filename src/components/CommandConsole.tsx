import { computed, defineComponent, ref, watch } from "vue";
import Modal from "./Modal";
import _ from "lodash";
import { useCommandConsole } from "@/hooks/vuex";
import { isBlank } from "@/utils";
import { Form, Field } from "vee-validate";
import { NamespacedCommand } from "@/commands";

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

    const onItemClick = (suggestion: NamespacedCommand) => {
      commandConsole.actions.selectAndRun() as any;
    };

    const onSubmit = () => {
      commandConsole.actions.selectAndRun();
    };

    const selectedIndex = computed(() => commandConsole.state.selectedIndex);

    const suggestions = computed(() =>
      commandConsole.getters.suggestions.map((suggestion, i) => (
        <a
          onClick={() => onItemClick(suggestion)}
          class={[
            "has-text-dark py-1 has-background-hover-light",
            { "has-background-light": selectedIndex.value === i },
          ]}
        >
          {suggestion}
        </a>
      ))
    );

    return () => (
      <Modal focusTrap={focusTrap.value} v-model={[isActive.value, "isActive"]}>
        <Form onSubmit={onSubmit}>
          <Field
            name="Command"
            class="input is-small"
            style="height:32px!important"
            v-model={[input.value, "modelValue"]}
            v-focusable={[null, "commandConsole"]}
          />
        </Form>
        <div class="is-flex is-flex-column">{suggestions.value}</div>
      </Modal>
    );
  },
});
