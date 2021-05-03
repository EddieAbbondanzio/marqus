<template>
    <div class="has-background-light" :style="`padding-left: ${indent}!important`">
        <Form @submit="$emit('submit')">
            <div>
                <div class="is-flex is-flex-row is-align-center has-background-light">
                    <Field :name="fieldName" :value="modelValue" v-slot="{ field }" :rules="rules">
                        <input
                            id="fieldValue"
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
                <ErrorMessage :name="fieldName" v-slot="{ message }">
                    <p id="errorMessage" class="has-text-danger">{{ message }}</p>
                </ErrorMessage>
            </div>
        </Form>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import IconButton from '@/components/core/IconButton.vue';
import { Field, ErrorMessage, Form } from 'vee-validate';

/**
 * Inline form for creating values in nav menus that only have 1
 * field to populate.
 */
export default defineComponent({
    props: {
        modelValue: {
            type: String,
            default: ''
        },
        indent: {
            type: String,
            default: '0px'
        },
        fieldName: {
            type: String,
            default: 'Field'
        },
        rules: {
            type: Function
        }
    },
    setup(p, c) {
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
            onInput,
            onBlur
        };
    },
    emits: ['submit', 'cancel', 'update:modelValue'],
    components: { Field, ErrorMessage, Form, IconButton }
});
</script>
