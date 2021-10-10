<template>
    <select :class="classes" :value="modelValue" @change="onChange">
        <slot></slot>
    </select>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

// Use native html <option> tag for items

export default defineComponent({
    setup(p, c) {
        const classes = computed(() => ['select', 'has-background-white', p.size]);

        const onChange = (e: any) => {
            c.emit('update:modelValue', e.target.value);
        };

        return {
            classes,
            onChange
        };
    },
    props: {
        modelValue: {
            type: String
        },
        size: {
            type: String,
            default: 'is-normal' // Can also be .is-small, .is-normal, .is-medium, .is-large
        }
    }
});
</script>
