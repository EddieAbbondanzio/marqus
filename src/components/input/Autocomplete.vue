<template>
    <Dropdown>
        <template #trigger="{focus, blur}">
            <input type="text" @focus="focus" @blur="blur" />
        </template>
        <template #content>
            CONTENT
        </template>
    </Dropdown>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Dropdown from '@/components/Dropdown.vue';

export default defineComponent({
    setup() {
        // fudge
    },
    components: { Dropdown }
});
</script>
