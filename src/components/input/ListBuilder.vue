<template>
    <div class="list-builder">
        <ul>
            <li
                class="list-item is-flex is-align-items-center is-justify-space-between"
                v-for="item in sortedSelected"
                :key="item.id"
            >
                <span class="is-size-7">{{ item.value }}</span> <DeleteButton @click.stop="() => onRemove(item)" />
            </li>
            <li class="list-item pt-1">
                <Form
                    v-slot="{ meta }"
                    ref="formRef"
                    @submit="onSubmit"
                    class="is-flex is-flex-column is-justify-center is-relative"
                >
                    <Field :name="inputName" v-model="input" v-slot="{ field }" :rules="rules">
                        <Autocomplete
                            :placeholder="inputPlaceholder"
                            :value="field.value"
                            @update:value="field['onUpdate:modelValue']"
                            :values="unusedValues"
                            @select="onSelect"
                        >
                            <template #dropdown v-if="meta.dirty && !meta.valid">
                                <ErrorMessage :name="inputName" v-slot="{ message }">
                                    <div
                                        id="errorMessage"
                                        class="notification is-danger p-1 mt-1 is-flex is-align-center"
                                    >
                                        <span class="icon is-small">
                                            <i class="fas fa-exclamation"></i>
                                        </span>

                                        <span class="is-size-7 pr-2"> {{ message }} </span>
                                    </div>
                                </ErrorMessage>
                            </template>
                        </Autocomplete>
                    </Field>
                </Form>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import DeleteButton from '@/components/buttons/DeleteButton.vue';
import { computed, defineComponent, Ref, ref } from 'vue';
import Autocomplete from '@/components/input/auto-complete/Autocomplete.vue';
import { Field, ErrorMessage, Form } from 'vee-validate';
import { caseInsensitiveCompare } from '@/shared/utils/string/case-insensitive-compare';
// import Icon from '@/components/elements/Icon.vue';

export default defineComponent({
    setup(p, c) {
        const unusedValues = computed(() => {
            const unused = p.values.filter((v: any) => !p.selected.some((s: any) => s.id === v.id));

            if (p.createAllowed) {
                unused.push({ id: '', value: `Create new ${p.inputName} '${input.value}'` });
            }

            return unused;
        });

        const input = ref('');
        const formRef: Ref<HTMLFormElement> = ref(null!);

        const onSubmit = () => {
            // Determine if it's a create, or add existing.
            const existing: any = p.values.find((v: any) => v.value === input.value);
            if (existing != null) {
                // Stop if we already have it selected. Prevents duplicates
                if (p.selected.some((v: any) => v.id === existing.id)) {
                    return;
                }

                c.emit('add', existing);
                c.emit('update:selected', [...p.selected, existing]);
                return;
            }

            if (p.createFactory == null) {
                throw Error('Cannot create. No factory to instantiate new values passed');
            }

            const newValue = p.createFactory(input.value);
            formRef.value.resetForm(); // This also removes any errors

            c.emit('add', newValue);
            c.emit('update:selected', [...p.selected, newValue]);
        };

        const onSelect = (opt: any) => {
            if (opt.id === '') {
                const newOpt = p.createFactory!(input.value);

                c.emit('add', newOpt);
                c.emit('update:selected', [...p.selected, newOpt]);
            } else {
                c.emit('add', opt);
                c.emit('update:selected', [...p.selected, opt]);
            }

            formRef.value.resetForm(); // This also removes any errors
        };

        const onRemove = (item: any) => {
            c.emit('remove', item);
            c.emit('update:selected', item);
        };

        const sortedSelected = computed(() => {
            const selected = p.selected as { value: string }[];
            return selected.sort(caseInsensitiveCompare((v) => v.value));
        });

        return {
            sortedSelected,
            formRef,
            onSubmit,
            onSelect,
            onRemove,
            input,
            unusedValues
        };
    },
    props: {
        /**
         * Array of possible options. Should be an object with an .id .value property.
         */
        values: {
            type: Array, // { id: string, value: string}[]
            required: true
        },
        selected: {
            type: Array,
            required: true
        },
        inputName: {
            type: String,
            default: 'value'
        },
        inputPlaceholder: {
            type: String
        },
        rules: {
            type: Object
        },
        createAllowed: {
            type: Boolean,
            default: true
        },
        createFactory: {
            type: Function // (val: string) => ({})
        }
    },
    emits: ['update:selected', 'add', 'remove'],
    components: { DeleteButton, Autocomplete, Field, Form, ErrorMessage }
});
</script>

<style lang="sass" scoped>
.list-builder
    .list-item
        span
            padding-left: 8px
</style>
