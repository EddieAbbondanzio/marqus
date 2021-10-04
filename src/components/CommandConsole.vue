<template>
    <modal :isActive="modalActive" >
      <div class="box mt-4">
        <Form @submit="onSubmit">
            <InputField label="Command" :hideLabel="true" v-model="inputValue" v-slot="{ field }">
              <input class="input" v-bind="field" placeholder="Type to run command..." v-context:commandConsole/>
            </InputField>
        </Form>
        </div>
    </modal>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import Modal from "@/components/Modal.vue";
import { useCommandConsole } from "@/store/modules/ui/modules/command-console";
import { Form } from "vee-validate";
import { COMMANDS, commands, isCommandName } from "@/commands";
import InputField from "@/components/input/InputField.vue";

export default defineComponent({
  setup() {
    const commandConsole = useCommandConsole();

    const inputValue = ref("");

    const onSubmit = () => {
      const { value: command } = inputValue;

      if (isCommandName(command)) {
        commands.run(command);

        // Hide the console after
        commandConsole.actions.hide();
      }
    };

    return {
      commands: computed(() => Object.keys(COMMANDS).map((value, id) => ({ id: String(id), value }))),
      onSubmit,
      inputValue,
      modalActive: computed(() => commandConsole.state.modalActive)
    };
  },
  components: { Modal, Form, InputField }
});
</script>
