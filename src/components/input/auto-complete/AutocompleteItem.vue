<template>
    <DropdownItem :value="value"><slot></slot></DropdownItem>
</template>

<script lang="ts">
import DropdownItem from '@/components/dropdown/DropdownItem.vue';
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        value: String
    },
    components: { DropdownItem }
});
</script>
