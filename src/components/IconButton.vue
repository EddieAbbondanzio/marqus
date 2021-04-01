<template>
    <button
        :class="{ button: true, 'is-icon-only': true, 'is-small': true, 'is-xs': size == 'is-xs' }"
        :type="type"
        @click="$emit('click')"
    >
        <span :class="{ icon: true, 'is-small': true, 'is-xs': size == 'is-xs' }">
            <i :class="classes"></i>
        </span>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    setup(p, c) {
        // fas fa-check fa-xs
        let size = 'fa-xs';

        if (p.size === 'is-small') {
            size = 'fa-sm';
        }

        const classes = `fas ${p.icon} ${size}`;

        return { classes };
    },
    props: {
        type: {
            type: String,
            default: 'button'
        },
        icon: {
            type: String,
            default: ''
        },
        size: {
            type: String,
            default: 'is-xs'
        }
    },
    emits: ['click']
});
</script>

<style lang="sass" scoped>
.button.is-icon-only
    background-color: transparent
    padding: 0 6px

    &.is-xs
    padding: 0 8px

    span
        border: none
        padding: 12px
        height: 16px

    span.is-xs
        padding: 8px
        height: 12px
</style>
