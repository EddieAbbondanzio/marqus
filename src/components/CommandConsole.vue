<template>
    <modal :isActive="modalActive" >
      <div class="box mt-4">
        <Form @submit="onSubmit">
            <Field name="Command" v-model="inputValue" v-slot="{ field }">
              <input class="input" v-bind="field" placeholder="Type to run command..." v-context:console/>
            </Field>
        </Form>
        </div>
    </modal>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import Modal from "@/components/Modal.vue";
import { useCommandConsole } from "@/store/modules/ui/modules/command-console";
import { Field, Form } from "vee-validate";
import { commands } from "@/commands";

export default defineComponent({
  setup() {
    const commandConsole = useCommandConsole();

    const inputValue = ref("");

    const onSubmit = () => {
      commands.run(inputValue.value as any);
    };

    return {
      onSubmit,
      inputValue,
      modalActive: computed(() => commandConsole.state.modalActive)
    };
  },
  components: { Modal, Field, Form }
});
</script>
