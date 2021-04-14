<template>
    <!-- If you don't have a submit listener, vee-validate won't .preventDefault() it.-->
    <Form @submit="onSubmit">
        <div class="has-background-light" :style="{ paddingLeft: `${depth * 24}px` }">
            <div class="is-flex is-flex-row has-background-light py-1">
                <Field name="Tag" :value="modelValue" v-slot="{ field }" :rules="unique">
                    <input
                        id="tagValue"
                        type="text"
                        v-bind="field"
                        style="min-width: 0; width: 0; flex-grow: 1;"
                        v-focus
                        @input="onInput"
                        @keyup.esc="$emit('cancel')"
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
            <ErrorMessage name="Tag" v-slot="{ message }">
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
                return 'Tag cannot be empty';
            }

            const existing = s.state.tags.values.find((t: any) => t.value.toUpperCase() === v.toUpperCase());

            if (existing != null && existing.id !== s.state.app.globalNavigation.tags.input.id) {
                return `Tag with value ${v} already exists`;
            }

            return true;
        };

        const onSubmit = () => {
            c.emit('submit');
        };

        const onInput = (e: any) => {
            c.emit('update:modelValue', e.target.value);
        };

        return {
            unique,
            onSubmit,
            onInput,
            depth: 1
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
