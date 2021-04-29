<template>
    <a class="is-block no-drag">
        <div
            :class="{
                'p-2': true,
                'has-background-hover-light': true,
                'has-text-grey': true,
                'has-background-light': active
            }"
            :style="`padding-left: ${indent}!important`"
        >
            <slot name="label">{{ label }}</slot>
        </div>

        <!-- Children -->
        <div class="has-background-transparent" v-if="hasChildren">
            <slot></slot>
        </div>
    </a>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

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
    setup(_, { slots }) {
        const hasChildren = computed(() => !!slots.default);

        return {
            hasChildren
        };
    },
    name: 'menu-item'
});
</script>
