<template>
    <div>
        <ul>
            <li v-for="item in selected" :key="item.id">
                {{ item.value }} <DeleteButton @click="() => onDelete(item)" />
            </li>
            <li>
                <Autocomplete
                    :values="values"
                    :createAllowed="true"
                    :createName="valueName"
                    @create="(v) => $emit('create', v)"
                    @select="onInputSelect"
                />
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import DeleteButton from '@/components/buttons/DeleteButton.vue';
import { defineComponent, ref } from 'vue';
import Autocomplete from '@/components/input/Autocomplete.vue';

export default defineComponent({
    setup(p, c) {
        const onDelete = (item: any) => {
            c.emit(
                'update:selected',
                p.selected.filter((p: any) => p.id !== item.id)
            );
        };

        const onInputSelect = (v: string) => {
            const newValue = p.values.find((p: any) => p.value === v);

            if (newValue == null) {
                return;
            }

            c.emit('update:selected', [...p.selected, newValue]);
        };

        return {
            onDelete,
            onInputSelect
        };
    },
    props: {
        /**
         * Array of possible options. Should be an object with an .id .value property.
         */
        values: {
            type: Array,
            required: true
        },
        selected: {
            type: Array,
            required: true
        },
        valueName: {
            type: String,
            default: 'value'
        }
    },
    emits: ['update:selected', 'create'],
    components: { DeleteButton, Autocomplete }
});
</script>
