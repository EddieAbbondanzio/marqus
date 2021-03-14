<template>
    <resizable modelValue="300px">
        <div class="has-h-100 has-text-dark">
            Global
        </div>
    </resizable>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Resizable from '@/components/Resizable.vue';

export default defineComponent({
    components: {
        Resizable
    }
});
</script>
