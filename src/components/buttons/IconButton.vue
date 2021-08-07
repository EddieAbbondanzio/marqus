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
        <Icon :icon="icon" />
    </button>
</template>

<script lang="ts">
import Icon from '@/components/elements/Icon.vue';
import { computed, defineComponent } from 'vue';

export default defineComponent({
    components: { Icon },
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
</style>
