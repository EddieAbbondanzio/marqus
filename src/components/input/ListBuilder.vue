<template>
    <div class="list-builder">
        <ul>
            <li class="list-item is-flex is-align-items-center" v-for="item in selected" :key="item.id">
                <span class="is-size-7">{{ item.value }}</span> <DeleteButton @click.stop="() => onDelete(item)" />
            </li>
            <li class="list-item pt-1">
                <Autocomplete
                    :placeholder="inputPlaceholder"
                    :values="unusedValues"
                    :createAllowed="true"
                    :createName="valueName"
                    @create="(v) => $emit('create', v)"
                    @select="onInputSelect"
                    :clearOnSelect="true"
                />
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import DeleteButton from '@/components/buttons/DeleteButton.vue';
import { computed, defineComponent, ref } from 'vue';
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

        const unusedValues = computed(() => p.values.filter((v: any) => !p.selected.some((s: any) => s.id === v.id)));

        return {
            unusedValues,
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
        },
        inputPlaceholder: {
            type: String
        }
    },
    emits: ['update:selected', 'create'],
    components: { DeleteButton, Autocomplete }
});
</script>

<style lang="sass" scoped>
.list-builder
    .list-item
        span
            padding-left: 8px
</style>
