<template>
    <Dropdown>
        <template #trigger="{toggle}">
            <input type="text" @focus="toggle" @blur="toggle" />
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
