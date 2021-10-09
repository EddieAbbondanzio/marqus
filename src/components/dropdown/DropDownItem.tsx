<template>
    <a :class="classes" @mousedown="onClick">
        <slot>{{ value }}</slot>
    </a>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
    setup(p, c) {
        const classes = computed(() => ({
            'dropdown-item': true,
            'is-active': p.active
        }));

        const onClick = () => {
            c.emit('click', p.value);
        };

        return {
            classes,
            onClick
        };
    },
    props: {
        /**
         * Item identifier
         */
        value: String,
        /**
         * If the item should be highlighted
         */
        active: {
            type: Boolean,
            default: false
        }
    },
    emits: ['click']
});
</script>
