<template>
    <resizable :modelValue="'300px'">
        <div class="has-background-light">
            LOCAL
        </div>
    </resizable>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Resizable from '@/components/Resizable.vue';

export default defineComponent({
    components: { Resizable }
});
</script>
