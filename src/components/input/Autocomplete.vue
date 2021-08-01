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
                v-model="input"
                :placeholder="placeholder"
            />
        </template>
        <template #content>
            <div v-if="available.length > 0">
                <a
                    href="#"
                    @mousedown.prevent="onSelect(item)"
                    v-for="(item, i) in available"
                    :key="item.id"
                    :class="`dropdown-item ${keyboardIndex == i ? 'is-active' : ''}`"
                >
                    {{ item.value }}
                </a>
            </div>
            <div v-else-if="createAllowed">
                <p class="is-size-7 p-1 is-flex is-align-items-center is-justify-content-center">
                    No match found. Press enter to create new {{ createName }} '{{ input }}'
                </p>
            </div>
        </template>
    </Dropdown>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, watch } from 'vue';
import Dropdown from '@/components/Dropdown.vue';
import { isBlank } from '@/shared/utils';

export default defineComponent({
    setup(p, c) {
        const input = ref('');
        const inputRef = ref<HTMLInputElement>(null!);

        const available = computed(() => {
            const unused = p.values.filter((v: any) => v.value.toLowerCase().includes(input.value.toLowerCase()));
            return unused;
        });

        watch(
            () => input.value,
            (value) => {
                // See if we can find the option
                const match = p.values.find((v: any) => v.value === value);

                if (match != null) {
                    c.emit('update:value', match);
                }
            }
        );

        const onSelect = (value: any) => {
            c.emit('update:value', value);
            input.value = value.value;

            c.emit('select', input.value);

            if (p.clearOnSelect) {
                input.value = '';
            }
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
                    if (available.value.length === 0 && !isBlank(input.value) && p.createAllowed) {
                        c.emit('create', input.value);

                        // Swallow native event
                        e.stopPropagation();
                    } else if (keyboardIndex.value > -1) {
                        input.value = (available.value as any)[keyboardIndex.value]!.value;
                        keyboardIndex.value = -1;

                        c.emit('select', input.value);

                        if (p.clearOnSelect) {
                            input.value = '';
                        }
                    }

                    input.value = '';
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
            input,
            onSelect,
            inputRef,
            onKeyUp
        };
    },
    props: {
        values: {
            type: Array,
            required: true
        },
        value: {
            type: Object
        },
        createAllowed: {
            type: Boolean,
            default: false
        },
        createName: {
            type: String,
            default: ''
        },
        clearOnSelect: {
            type: Boolean,
            default: false
        },
        placeholder: {
            type: String
        }
    },
    emits: ['update:value', 'focus', 'blur', 'create', 'select'],
    components: { Dropdown }
});
</script>
