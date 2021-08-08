<template>
    <DropdownItem :value="value" :active="active" @click="onClick"
        ><slot>{{ value }}</slot></DropdownItem
    >
</template>

<script lang="ts">
import DropdownItem from '@/components/dropdown/DropdownItem.vue';
import { defineComponent } from 'vue';

export default defineComponent({
    setup(p, c) {
        const onClick = (e: any) => c.emit('click', e);

        return {
            onClick
        };
    },
    props: {
        value: String,
        /**
         * If the item should be highlighted
         */
        active: {
            type: Boolean,
            default: false
        }
    },
    emits: ['click'],
    components: { DropdownItem }
});
</script>
