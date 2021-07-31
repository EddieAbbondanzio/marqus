<template>
    <Dropdown :active="active" @update:active="onActiveUpdate">
        <template #trigger="{toggle}">
            <IconButton :icon="icon" size="is-size-6" class="p-3" @click="toggle" :isHovered="active" />
        </template>

        <template #content>
            <slot name="dropdown"></slot>
        </template>
    </Dropdown>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Dropdown from '@/components/Dropdown.vue';
import IconButton from '@/components/buttons/IconButton.vue';

export default defineComponent({
    setup(p, c) {
        const onActiveUpdate = (v: boolean) => {
            console.log(v);
            c.emit('update:active', v);
        };

        return {
            onActiveUpdate
        };
    },
    props: {
        active: {
            type: Boolean,
            default: false
        },
        icon: {
            type: String,
            required: true
        }
    },
    emits: ['update:active'],
    components: { Dropdown, IconButton }
});
</script>
