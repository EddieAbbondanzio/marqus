<template>
    <button
        :class="[
            'button',
            'is-icon-only',
            'mb-0',
            size,
            {
                'is-hovered': isHovered,
                'is-focused': isFocused,
                'is-active': isActive
            }
        ]"
        :type="type"
        @click="$emit('click', $event)"
    >
        <span class="icon">
            <i :class="iconClasses"></i>
        </span>
    </button>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
    setup(p, c) {
        const iconClasses = computed(() => `fas ${p.icon}`);
        return { iconClasses };
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
            default: 'is-size-5' // Allows any of the is-size-X.
        },
        isActive: {
            type: Boolean,
            default: false
        },
        isFocused: {
            type: Boolean,
            default: false
        },
        isHovered: {
            type: Boolean,
            default: false
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
    height: 21px

    span
        border: none
        padding: 12px
        height: 16px

    span.is-xs
        padding: 8px
        height: 12px
</style>
