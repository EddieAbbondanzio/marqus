<template>
    <div class="field">
        <label class="label" v-if="!hideLabel && label != null">{{ label }}</label>

        <div class="control">
            <Field
                v-model:modelValue="computedModelValue"
                :name="label"
                v-slot="{ field, meta, errors, errorMessage }"
                :rules="rules"
            >
                <slot :field="field" :meta="meta" :errors="errors" :errorMessage="errorMessage"></slot>
            </Field>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { Field, ErrorMessage, Form } from 'vee-validate';

export default defineComponent({
    setup(p, c) {
        const computedModelValue = computed({
            get: () => p.modelValue ?? '',
            set: (v) => c.emit('update:modelValue', v)
        });

        return {
            computedModelValue
        };
    },
    props: {
        modelValue: String,
        label: String,
        hideLabel: {
            type: Boolean,
            default: false
        },
        rules: {
            type: Object,
            default: () => ({})
        }
    },
    emits: ['update:modelValue'],
    components: { Field }
});
</script>
