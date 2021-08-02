<template>
    <Dropdown>
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
        <template #content>
            <slot name="dropdown">
                <div v-if="available.length > 0">
                    <a
                        @mousedown.stop="onSelect(item)"
                        v-for="(item, i) in available"
                        :key="item.id"
                        :class="`dropdown-item ${keyboardIndex == i ? 'is-active' : ''}`"
                    >
                        {{ item.value }}
                    </a>
                </div>
                <div v-else-if="createAllowed">
                    <p class="is-size-7 p-1 is-flex is-align-items-center is-justify-content-center">
                        No match found. Press enter to create new {{ createName }} '{{ value }}'
                    </p>
                </div>
            </slot>
        </template>
    </Dropdown>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, watch } from 'vue';
import Dropdown from '@/components/Dropdown.vue';
import { isBlank } from '@/shared/utils';

export default defineComponent({
    setup(p, c) {
        const inputRef = ref<HTMLInputElement>(null!);

        // watch(() => p.value, () => {
        //     console.log('auto complete model updated!');
        // });

        const available = computed(() =>
            p.values.filter((v: any) => {
                if (v?.value == null) {
                    return false;
                }

                return v.value.toLowerCase().includes(p.value.toLowerCase());
            })
        );

        const onInput = (e: any) => {
            c.emit('update:value', inputRef.value.value);
            // input.value = inputRef.value.value;
        };

        const onSelect = (option: any) => {
            c.emit('update:value', option.value);
            // input.value = option.value;

            c.emit('select', option);
        };

        const keyboardIndex = ref(-1);

        const onKeyUp = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowUp':
                    if (keyboardIndex.value > 0) keyboardIndex.value--;
                    break;

                case 'ArrowDown':
                    if (keyboardIndex.value < available.value.length - 1) keyboardIndex.value++;
                    break;

                case 'Enter':
                    // Detect if we are going to create one
                    if (!p.createAllowed) {
                        return;
                    } else if (keyboardIndex.value > -1) {
                        c.emit('update:value', (available.value as any)[keyboardIndex.value]!.value);
                        // input.value = (available.value as any)[keyboardIndex.value]!.value;
                        keyboardIndex.value = -1;
                    }

                    inputRef.value.blur();

                    break;

                case 'Escape':
                    inputRef.value.blur();
                    c.emit('blur');
                    break;
            }
        };

        return {
            available,
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
        createAllowed: {
            type: Boolean,
            default: false
        },
        createName: {
            type: String,
            default: ''
        },
        placeholder: {
            type: String
        }
    },
    emits: ['update:value', 'focus', 'blur', 'create', 'select'],
    components: { Dropdown }
});
</script>
