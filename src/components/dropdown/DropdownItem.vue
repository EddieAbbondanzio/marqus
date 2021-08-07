<template>
    <a :class="classes">
        <slot>{{ value }}</slot>
    </a>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
    setup(p) {
        const classes = computed(() => ({
            'dropdown-item': true,
            'is-active': p.active
        }));

        return {
            classes
        };
    },
    props: {
        /**
         * Display value
         */
        value: String,
        /**
         * If the item should be highlighted
         */
        active: {
            type: Boolean,
            default: false
        }
    }
});
</script>
