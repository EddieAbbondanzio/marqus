<template>
    <div class="collapse-wrapper">
        <a
            @click="$emit('update:modelValue', !modelValue)"
            :class="
                `${triggerClass} no-drag collapse-trigger is-flex is-align-center is-justify-space-between has-text-grey pr-1`
            "
            :style="{ 'pointer-events': disabled ? 'none' : 'default' }"
        >
            <slot name="trigger"></slot>

            <icon-button icon="fa-chevron-down" v-if="!modelValue" />
            <icon-button icon="fa-chevron-up" v-else />
        </a>

        <div v-if="modelValue">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, onMounted, Ref, ref, watch } from 'vue';
import IconButton from '@/components/Core/IconButton.vue';

export default defineComponent({
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        modelValue: {
            type: Boolean,
            default: false
        },
        triggerClass: {
            type: String,
            default: ''
        }
    },
    emits: ['update:modelValue'],
    components: {
        IconButton
    }
});
</script>
