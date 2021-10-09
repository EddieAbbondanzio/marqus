<template>
    <IconButton icon="fa-times" class="has-text-hover-danger has-text-grey" :size="size" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import IconButton from '@/components/buttons/IconButton.vue';

export default defineComponent({
    props: {
        size: {
            type: String,
            default: 'is-size-7'
        }
    },
    components: { IconButton }
});
</script>
