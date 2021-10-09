<template>
    <Dropdown :active="active" @update:active="onActiveUpdate">
        <template #trigger="{toggle}">
            <IconButton :icon="icon" size="is-size-6" class="px-3 py-0" @click="toggle" :isHovered="active" />
        </template>

        <template #content>
            <div class="px-3">
                <slot name="dropdown"></slot>
            </div>
        </template>
    </Dropdown>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Dropdown from '@/components/dropdown/dropdown';
import IconButton from '@/components/buttons/IconButton.vue';

export default defineComponent({
    setup(p, c) {
        const onActiveUpdate = (v: boolean) => c.emit('update:active', v);

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
