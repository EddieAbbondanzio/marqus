<template>
    <div class="collapse-wrapper">
        <div class="is-flex is-align-center is-justify-space-between">
            <slot name="trigger"></slot>

            <a href="#" @click="$emit('update:modelValue', !modelValue)" v-if="modelValue" class="has-text-grey">
                <span class="icon">
                    <i class="fas fa-chevron-down"></i>
                </span>
            </a>
            <a href="#" @click="$emit('update:modelValue', !modelValue)" v-else class="has-text-grey">
                <span class="icon">
                    <i class="fas fa-chevron-up"></i>
                </span>
            </a>
        </div>

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
