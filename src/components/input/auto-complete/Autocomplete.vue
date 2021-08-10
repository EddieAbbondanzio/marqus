<template>
    <Dropdown class="autocomplete-dropdown" :items="matches()" v-model:active="isActive">
        <template #trigger="{focus, blur}">
            <input
                class="input is-small"
                type="text"
                ref="inputRef"
                @focus="focus"
                @blur="blur"
                @keyup="onKeyUp"
                @input="onInput"
                :value="modelValue"
                :placeholder="placeholder"
            />
        </template>

        <template #content="{ items }">
            <slot name="dropdown">
                <div v-if="items.length == 0">
                    <slot name="empty"></slot>
                </div>

                <div v-for="(item, index) in items" :key="item.id">
                    <slot name="item" :item="item" :index="index">
                        <AutocompleteItem :value="item.id" :active="keyboardIndex === index" @click="onSelect(item)">{{
                            item.value
                        }}</AutocompleteItem>
                    </slot>
                </div>
            </slot>
        </template>
    </Dropdown>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, watch } from 'vue';
import Dropdown from '@/components/dropdown/Dropdown.vue';
import { isBlank } from '@/shared/utils';
import AutocompleteItem from '@/components/input/auto-complete/AutocompleteItem.vue';

export default defineComponent({
    setup(p, c) {
        const inputRef = ref<HTMLInputElement>(null!);

        const isActive = ref(false);

        // Method because computed prop wasn't updating on change
        const matches = () => {
            // Catch no input
            const value = inputRef.value?.value ?? '';

            if (isBlank(value)) {
                return p.values;
            }

            // Find all the unused values
            const unused = (p.values as { id: string; value: string }[]).filter((v: any) =>
                v.value.toLowerCase().includes(value.toLowerCase())
            );

            return unused;
        };

        const onInput = (e: any) => {
            keyboardIndex.value = -1;
            c.emit('update:modelValue', inputRef.value.value);
        };

        const onSelect = (value: any) => {
            c.emit('select', value);
        };

        const keyboardIndex = ref(-1);

        const onKeyUp = (e: KeyboardEvent) => {
            const availableLength = matches().length;

            switch (e.key) {
                case 'ArrowUp':
                    if (keyboardIndex.value > 0) keyboardIndex.value--;
                    break;

                case 'ArrowDown':
                    if (keyboardIndex.value < availableLength - 1) {
                        keyboardIndex.value++;
                    }
                    break;

                case 'Enter':
                    if (keyboardIndex.value >= 0) {
                        const match = (matches() as any)[keyboardIndex.value]!;
                        keyboardIndex.value = -1;
                        inputRef.value.blur();
                        c.emit('select', match);

                        inputRef.value.value = '';
                    }
                    break;

                case 'Escape':
                    inputRef.value.blur();
                    c.emit('blur');
                    break;
            }
        };

        return {
            isActive,
            matches,
            keyboardIndex,
            onSelect,
            inputRef,
            onKeyUp,
            onInput
        };
    },
    props: {
        values: {
            type: Array,
            required: true
        },
        modelValue: {
            type: String,
            required: true
        },
        placeholder: {
            type: String
        },
        hideDropdown: {
            type: Boolean,
            default: false
        }
    },
    emits: ['update:modelValue', 'focus', 'blur', 'select'],
    components: { Dropdown, AutocompleteItem }
});
</script>

<style lang="sass">
.autocomplete-dropdown
    .dropdown-menu
        max-height: calc(33px*8)
        overflow-y: scroll

        a
            height: 33px!important

.dropdown-item
    display: flex
    align-items: center
</style>
