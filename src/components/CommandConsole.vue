<template>
    <modal :isActive="modalActive" @update:modelValue="onUpdateModalActive" :focusTrap="focusTrap">
      <div class="box mt-4">
        <!-- Input -->
        <Form @submit="onSubmit">
            <InputField label="Command" :hideLabel="true" v-model="input" v-slot="{ field }">
              <input class="input" v-bind="field" placeholder="Type to run command..." v-context:commandConsole />
            </InputField>
        </Form>

        <!-- Suggestions -->
        <div v-for="(match, i) in matches" :key="i">
          {{ match }}
        </div>
      </div>
    </modal>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import Modal from "@/components/Modal.vue";
import { useCommandConsole } from "@/store/modules/ui/modules/command-console";
import { Form } from "vee-validate";
import { COMMANDS, commands, isCommandName } from "@/commands";
import InputField from "@/components/input/InputField.vue";
import { isBlank } from "@/utils";

export default defineComponent({
  setup() {
    const commandConsole = useCommandConsole();

    const input = computed({
      get() { return commandConsole.state.input; },
      set(v: string) { commandConsole.actions.setInput(v); }
    });

    const onSubmit = () => {
      if (isCommandName(input.value)) {
        commands.run(input.value);

        // Hide the console after
        commandConsole.actions.hide();
      }
    };

    const available = computed(() => Object.keys(COMMANDS));

    const matches = computed(() => {
      return Object.keys(COMMANDS).filter(c => c.toLowerCase().includes(input.value.toLowerCase()));
    });

    /*
    * If the user provides an input, assume we should make it harder to exit the modal so they don't
    * accidentally lose their place.
    */
    const focusTrap = computed(() => !isBlank(input.value) ? "hard" : "soft");

    return {
      available,
      matches,
      onSubmit,
      input,
      focusTrap,
      modalActive: computed(() => commandConsole.state.modalActive),
      onUpdateModalActive: commandConsole.actions.setActive
    };
  },
  components: { Modal, Form, InputField }
});
</script>
