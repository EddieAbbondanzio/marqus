<template>
    <modal :isActive="modalActive" >
      <div class="box mt-4">
        <Form>
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
import { useConsole } from "@/store/modules/ui/modules/console";
import { Field, Form } from "vee-validate";

export default defineComponent({
  setup() {
    const console = useConsole();

    const inputValue = ref("");

    return {
      inputValue,
      modalActive: computed(() => console.state.modalActive)
    };
  },
  components: { Modal, Field, Form }
});
</script>
