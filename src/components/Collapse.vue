<template>
    <div class="collapse-wrapper">
        <a
            href="#"
            @click="$emit('update:modelValue', !modelValue)"
            :class="
                `${triggerClass} collapse-trigger is-flex is-align-center is-justify-space-between has-text-grey pr-1`
            "
        >
            <slot name="trigger"></slot>

            <div class="has-background-transparent" v-if="!modelValue">
                <span class="icon is-small">
                    <i class="fas fa-chevron-down"></i>
                </span>
            </div>
            <div class="has-background-transparent" v-else>
                <span class="icon is-small">
                    <i class="fas fa-chevron-up"></i>
                </span>
            </div>
        </a>

        <div v-if="modelValue">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, onMounted, Ref, ref, watch } from 'vue';

export default defineComponent({
    props: {
        modelValue: {
            type: Boolean,
            default: false
        },
        triggerClass: {
            type: String,
            default: ''
        }
    },
    emits: ['update:modelValue']
});
</script>
