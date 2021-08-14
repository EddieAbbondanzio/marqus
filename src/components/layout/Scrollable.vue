<template>
    <div class="scrollable-wrapper">
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    setup() {
        console.log('eh');
    },
    props: {
        modelValue: {
            type: Number,
            default: 0
        }
    }
});
</script>

<style lang="sass" scoped>
.scrollable-wrapper
    overflow-x: hidden
    overflow-y: auto
    max-height: 100%
</style>
