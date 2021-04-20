<template>
    <Form @submit="$emit('submit')">
        <div class="has-background-light">
            <div class="is-flex is-flex-row is-align-center has-background-light py-1">
                <Field name="Notebook" :value="modelValue" v-slot="{ field }" :rules="unique">
                    <input
                        id="notebookValue"
                        type="text"
                        style="min-width: 0; width: 0; flex-grow: 1;"
                        v-bind="field"
                        v-focus
                        @input="onInput"
                        @keyup.esc="$emit('cancel')"
                        @blur="onBlur"
                    />

                    <icon-button class="has-text-hover-success" type="submit" icon="fa-check" />

                    <icon-button class="has-text-hover-danger" icon="fa-ban" @click="$emit('cancel')" />
                </Field>
            </div>
            <ErrorMessage name="Notebook" v-slot="{ message }">
                <p id="errorMessage" class="has-text-danger">{{ message }}</p>
            </ErrorMessage>
        </div>
    </Form>
</template>

<script lang="ts">
import { isBlank } from '@/utils/is-blank';
import { computed, defineComponent, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { Field, ErrorMessage, Form, useForm } from 'vee-validate';
import IconButton from '@/components/IconButton.vue';

export default defineComponent({
    setup(p, c) {
        const s = useStore();

        const unique = (v: any) => {
            if (v == null || isBlank(v)) {
                return 'Name cannot be empty';
            }

            const existing = s.state.app.globalNavigation.notebooks.entries.find(
                (t: any) => t.value.toUpperCase() === v.toUpperCase()
            );
            if (existing != null && existing.id !== s.state.app.globalNavigation.notebooks.input.id) {
                return `Notebook with name ${v} already exists`;
            }

            return true;
        };

        const onInput = (e: any) => {
            c.emit('update:modelValue', e.target.value);
        };

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
