<template>
    <div>
        <ul>
            <li v-for="item in selected" :key="item.id">
                {{ item.value }} <DeleteButton @click="() => onDelte(item)" />
            </li>
            <li><Autocomplete /></li>
        </ul>
    </div>
</template>

<script lang="ts">
import DeleteButton from '@/components/buttons/DeleteButton.vue';
import { defineComponent } from 'vue';
import Autocomplete from '@/components/input/Autocomplete.vue';

export default defineComponent({
    setup(p, c) {
        const onDelete = (item: any) => {
            c.emit(
                'update:selected',
                p.selected.filter((p: any) => p.id !== item.id)
            );
        };

        return {
            onDelete
        };
    },
    props: {
        /**
         * Array of possible options. Should be an object with an .id .value property.
         */
        available: {
            type: Array,
            required: true
        },
        selected: {
            type: Array,
            required: true
        }
    },
    emits: ['update:selected'],
    components: { DeleteButton, Autocomplete }
});
</script>
