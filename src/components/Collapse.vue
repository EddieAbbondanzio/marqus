<template>
    <div class="collapse-wrapper">
        <a
            href="#"
            @click="$emit('update:modelValue', !modelValue)"
            class="collapse-trigger is-flex is-align-center is-justify-space-between has-text-grey"
        >
            <slot name="trigger"></slot>

            <div v-if="modelValue">
                <span class="icon">
                    <i class="fas fa-chevron-down"></i>
                </span>
            </div>
            <div v-else>
                <span class="icon">
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
        }
    },
    emits: ['update:modelValue']
});
</script>
