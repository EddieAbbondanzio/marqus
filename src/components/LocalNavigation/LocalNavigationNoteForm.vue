<template>
    <Form @submit="$emit('submit')">
        <div class="has-background-light p-1">
            <div class="is-flex is-flex-row is-align-center has-background-light">
                <Field name="Note" :value="modelValue" v-slot="{ field }" :rules="unique">
                    <input
                        id="noteValue"
                        type="text"
                        v-bind="field"
                        style="min-width: 0; width: 0; flex-grow: 1;"
                        v-focus
                        @input="onInput"
                        @keyup.esc="$emit('cancel')"
                        @blur="onBlur"
                    />
                    <icon-button class="has-text-hover-success" type="submit" icon="fa-check" />
                    <icon-button
                        id="cancelButton"
                        class="has-text-hover-danger"
                        icon="fa-ban"
                        @click="$emit('cancel')"
                    />
                </Field>
            </div>
            <ErrorMessage name="Note" v-slot="{ message }">
                <p id="errorMessage" class="has-text-danger">{{ message }}</p>
            </ErrorMessage>
        </div>
    </Form>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { Field, ErrorMessage, Form } from 'vee-validate';
import { useStore } from 'vuex';
import { isBlank } from '@/utils/is-blank';
import IconButton from '@/components/IconButton.vue';

export default defineComponent({
    setup(p, c) {
        const s = useStore();

        const unique = (v: any) => {
            if (v == null || isBlank(v)) {
                return 'Note name cannot be empty';
            }

            const existing = s.state.notes.values.find((t: any) => t.name.toUpperCase() === v.toUpperCase());

            if (existing != null && existing.id !== s.state.app.localNavigation.notes.input.id) {
                return `Note with name ${v} already exists`;
            }

            return true;
        };

        const onInput = (e: any) => {
            c.emit('update:modelValue', e.target.value);
        };

        // When input is blurred, check to see if it was empty. If it was empty, cancel.
        const onBlur = (e: any) => {
            if (e.target.value === '') {
                c.emit('cancel');
            }
        };

        return {
            unique,
            onInput,
            onBlur
        };
    },
    props: {
        modelValue: {
            type: String,
            default: ''
        }
    },
    emits: ['submit', 'cancel', 'update:modelValue'],
    components: { Field, ErrorMessage, Form, IconButton }
});
</script>
