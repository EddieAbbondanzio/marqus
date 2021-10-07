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
        <div class="is-flex is-flex-column">
            <a
            :class="['has-text-dark py-1 has-background-hover-light', {'has-background-light': selectedIndex === i }
            ]"
              v-for="(suggestion, i) in suggestions" :key="i" @click="onItemClick(suggestion)"
            >
            {{ suggestion }}
            </a>
        </div>
      </div>
    </modal>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import Modal from "@/components/Modal.vue";
import { useCommandConsole } from "@/store/modules/ui/modules/command-console";
import { Form } from "vee-validate";
import { commands, isNamespacedCommand } from "@/commands";
import InputField from "@/components/input/InputField.vue";
import { isBlank } from "@/utils";

export default defineComponent({
  setup() {
    const commandConsole = useCommandConsole();

    const input = computed({
      get() { return commandConsole.state.input; },
      set(v: string) { commandConsole.actions.setInput(v); }
    });

    const onSubmit = () => commandConsole.actions.selectAndRun();

    /*
    * If the user provides an input, assume we should make it harder to exit the modal so they don't
    * accidentally lose their place.
    */
    const focusTrap = computed(() => !isBlank(input.value) ? "hard" : "soft");

    const onItemClick = () => commandConsole.actions.selectAndRun();

    return {
      suggestions: computed(() => commandConsole.getters.suggestions),
      onSubmit,
      input,
      focusTrap,
      modalActive: computed(() => commandConsole.state.modalActive),
      onUpdateModalActive: commandConsole.actions.setActive,
      onItemClick,
      selectedIndex: computed(() => commandConsole.state.selectedIndex)
    };
  },
  components: { Modal, Form, InputField }
});
</script>
