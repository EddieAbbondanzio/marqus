<template>
    <button class="button is-small is-icon-only" :type="type" @click="$emit('click')">
        <span class="icon is-small">
            <i :class="classes"></i>
        </span>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    setup(p, c) {
        // fas fa-check fa-xs
        const classes = `fas ${p.icon} fa-xs`;

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
        }
    },
    emits: ['click']
});
</script>

<style lang="sass" scoped>
.button.is-icon-only
    padding: 0 6px
    background-color: transparent

    span
        border: none
        padding: 8px
        height: 12px
</style>
