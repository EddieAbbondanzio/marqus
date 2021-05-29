<template>
    <div :class="`tag-input ${size}`">
        <Dropdown>
            <template #trigger="{ toggle }">
                <div class="is-focusable is-flex is-flex-column is-align-start" @click="inputRef.focus()">
                    <label class="label" v-if="label != null">{{ label }}</label>

                    <div class="is-block" v-for="tag in selected" :key="tag.id">
                        <span class="tag mx-1">
                            {{ tag.value }}
                            <button
                                class="pl-1 delete is-small"
                                @mousedown.prevent.stop="onDeleteSelectedTag(tag)"
                                @click="toggle"
                            ></button>
                        </span>
                    </div>

                    <div :class="`control ${icon != null ? 'has-icons-left' : ''}`">
                        <input
                            id="tag-input"
                            v-model="inputValue"
                            class="input is-small"
                            :placeholder="placeholder"
                            ref="inputRef"
                            @input="onInput"
                            @keyup="onKeyUp"
                            @focus="setActive(true)"
                            @blur="setActive(false)"
                        />
                        <span class="icon is-small is-left" v-if="icon">
                            <i :class="`fas ${icon}`"></i>
                        </span>
                    </div>
                </div>
            </template>

            <template #menu>
                <div class="dropdown-menu p-0 mt-1" :style="!localActive ? 'display: none!important' : ''">
                    <div class="dropdown-content p-0">
                        <a
                            href="#"
                            @mousedown.prevent="onAddSelectedTag(tag)"
                            v-for="(tag, i) in available"
                            :key="tag.id"
                            :class="`dropdown-item ${keyboardIndex == i ? 'is-active' : ''}`"
                        >
                            {{ tag.value }}
                        </a>
                    </div>
                </div>
            </template>
        </Dropdown>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, Ref, ref } from 'vue';
import Dropdown from '@/core/components/Dropdown.vue';

export default defineComponent({
    props: {
        icon: String,
        placeholder: String,
        label: {
            type: String
        },
        active: {
            type: Boolean,
            default: false
        },
        size: {
            type: String,
            default: 'is-small'
        },
        values: {
            type: Array,
            default: () => []
        },
        selected: {
            type: Array,
            default: () => []
        }
    },
    setup(p, c) {
        const localActive = ref(p.active);

        const setActive = (v: boolean) => {
            localActive.value = v;
            c.emit('update:active', localActive.value);
        };

        const onDeleteSelectedTag = (tag: any) => {
            const remaining = p.selected.filter((t: any) => t.id !== tag.id);
            c.emit('update:selected', remaining);
        };

        const onAddSelectedTag = (tag: any) => {
            const newSelected = [...p.selected, tag];
            c.emit('update:selected', newSelected);

            inputValue.value = '';
        };

        const inputRef = ref(null) as any;
        const inputValue = ref('');

        const available = computed(() => {
            const unused = p.values.filter((t1: any) => !p.selected.some((t2: any) => t1.id === t2.id));
            return unused.filter((t: any) => t.value.toLowerCase().includes(inputValue.value.toLowerCase()));
        });

        const keyboardIndex = ref(-1);

        const onInput = () => {
            keyboardIndex.value = -1;
        };

        const onKeyUp = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowUp':
                    if (keyboardIndex.value > 0) keyboardIndex.value--;
                    break;
                case 'ArrowDown':
                    if (keyboardIndex.value < available.value.length - 1) keyboardIndex.value++;
                    break;
                case 'Enter':
                    if (keyboardIndex.value > -1) {
                        onAddSelectedTag(available.value[keyboardIndex.value]);
                        keyboardIndex.value = -1;
                    }
                    // If only 1 filtered option left, allow select of it via enter
                    else if (available.value.length === 1 && inputValue.value !== '') {
                        onAddSelectedTag(available.value[0]);
                    }
                    break;
            }
        };

        const focus = async () => {
            await nextTick();
            inputRef.value.focus();
        };

        return {
            inputRef,
            setActive,
            localActive,
            onAddSelectedTag,
            onDeleteSelectedTag,
            available,
            inputValue,
            onInput,
            onKeyUp,
            keyboardIndex,
            focus
        };
    },
    emits: ['update:active', 'update:selected'],
    components: {
        Dropdown
    }
});
</script>

<style lang="sass" scoped>
.tag-input
    display: flex
    flex-shrink: 1
    flex-direction: column

    &.is-small
        flex-basis: 30px

        .dropdown-trigger
            height: 30px
            min-height: 30px
            padding: 0px

            .input
                max-height: 28px;

    &.is-medium
        flex-basis: 50px

        .dropdown-trigger
            height: 50px
            min-height: 30px

            .input
                max-height: 48px

    &.is-large
        flex-basis: 60px

        .dropdown-trigger
            height: 60px
            min-height: 60px

            .input
                max-height: 58px

.dropdown-trigger
    cursor: text
    display: inline-flex
    flex-wrap: wrap
    flex-direction: row
    justify-content: flex-start

    .input
        max-height: calc(2.5em - 2px)
        border: none  !important
        box-shadow: none!important

        &:focus
            outline: none!important

.dropdown-menu
    right: 0

    .dropdown-content
        width: 100%
</style>
