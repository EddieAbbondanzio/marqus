<template>
    <div>
        <a
            class="is-block no-drag"
            :class="{
                'p-2': true,
                'has-background-hover-light': true,
                'has-text-grey': true,
                'has-background-light': active
            }"
            :style="`padding-left: ${indent}!important`"
        >
            <slot name="label">{{ label }}</slot>

            <!-- Expand / Collapse button -->
            <slot name="trigger" :toggle="toggle"> </slot>
        </a>

        <!-- Children -->
        <div class="has-background-transparent" v-if="hasChildren">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import IconButton from '@/components/core/IconButton.vue';

export default defineComponent({
    props: {
        active: {
            type: Boolean,
            default: false
        },
        label: {
            type: String,
            default: ''
        },
        expanded: {
            type: Boolean,
            default: false
        },
        indent: {
            type: String,
            default: '0px'
        }
    },
    setup(p, { slots }) {
        const hasChildren = computed(() => !!slots.default);

        const toggle = () => !p.expanded;

        return {
            hasChildren,
            toggle
        };
    },
    name: 'menu-item',
    components: { IconButton }
});
</script>
