<template>
    <Dropdown :items="matches()">
        <template #trigger="{focus, blur}">
            <input
                class="input is-small"
                type="text"
                ref="inputRef"
                @focus="focus"
                @blur="blur"
                @keyup="onKeyUp"
                @input="onInput"
                :value="value"
                :placeholder="placeholder"
            />
        </template>

        <template #item="{item, index }">
            <DropdownItem :value="item.id" :active="keyboardIndex === index">{{ item.value }}</DropdownItem>
        </template>
    </Dropdown>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, watch } from 'vue';
import Dropdown from '@/components/dropdown/Dropdown.vue';
import DropdownItem from '@/components/dropdown/DropdownItem.vue';
import { isBlank } from '@/shared/utils';
import DropdownMenu from '@/components/dropdown/DropdownMenu.vue';

export default defineComponent({
    setup(p, c) {
        const inputRef = ref<HTMLInputElement>(null!);

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
            c.emit('update:value', inputRef.value.value);
            keyboardIndex.value = -1;
        };

        const onSelect = (option: any) => {
            c.emit('update:value', option.value);
            c.emit('select', option);
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
                        c.emit('update:value', (matches() as any)[keyboardIndex.value]!.value);

                        keyboardIndex.value = -1;
                        inputRef.value.blur();
                    }
                    break;

                case 'Escape':
                    inputRef.value.blur();
                    c.emit('blur');
                    break;
            }
        };

        return {
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
        value: {
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
    emits: ['update:value', 'focus', 'blur', 'select'],
    components: { Dropdown, DropdownItem }
});
</script>

<style lang="sass" scoped>
.autocomplete-options
    max-height: calc(33px*8)
    overflow-y: scroll

    a
        height: 33px!important

.dropdown-item
    display: flex
    align-items: center
</style>
