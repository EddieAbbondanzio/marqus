<template>
    <div class="list-builder">
        <ul>
            <li
                class="list-item is-flex is-align-items-center is-justify-space-between"
                v-for="item in sortedSelected"
                :key="item.id"
            >
                <span class="is-size-7">{{ item.value }}</span> <DeleteButton @click.stop="() => onDelete(item)" />
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
                            v-bind="field"
                            :values="unusedValues"
                            :createAllowed="true"
                            :createName="inputName"
                            @select="onAdd"
                        />
                    </Field>

                    <ErrorMessage :name="inputName" v-slot="{ message }" v-if="meta.dirty">
                        <div id="errorMessage" class="notification is-danger p-1 is-flex is-align-center">
                            <span class="icon is-small">
                                <i class="fas fa-exclamation"></i>
                            </span>

                            <span class="is-size-7 pr-2"> {{ message }} </span>
                        </div>
                    </ErrorMessage>
                </Form>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import DeleteButton from '@/components/buttons/DeleteButton.vue';
import { computed, defineComponent, Ref, ref } from 'vue';
import Autocomplete from '@/components/input/Autocomplete.vue';
import { Field, ErrorMessage, Form } from 'vee-validate';

export default defineComponent({
    setup(p, c) {
        const onDelete = (item: any) => {
            c.emit(
                'update:selected',
                p.selected.filter((p: any) => p.id !== item.id)
            );
        };

        const unusedValues = computed(() => p.values.filter((v: any) => !p.selected.some((s: any) => s.id === v.id)));

        const input = ref('');
        const formRef = ref(null as any);

        const onSubmit = (e: any) => {
            c.emit('create', input.value);
            formRef.value.resetForm(); // This also removes any errors
        };

        const onAdd = (v: any) => {
            c.emit('update:selected', [...p.selected, v]);
        };

        const sortedSelected = computed(() => {
            const selected = p.selected as { value: string }[];
            return selected.sort((a, b) => a.value.toLowerCase().localeCompare(b.value.toLowerCase()));
        });

        return {
            sortedSelected,
            formRef,
            onAdd,
            onSubmit,
            input,
            unusedValues,
            onDelete
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
        inputName: {
            type: String,
            default: 'value'
        },
        inputPlaceholder: {
            type: String
        },
        rules: {
            type: Object
        }
    },
    emits: ['update:selected', 'create'],
    components: { DeleteButton, Autocomplete, Field, Form, ErrorMessage }
});
</script>

<style lang="sass" scoped>
.list-builder
    .list-item
        span
            padding-left: 8px
</style>
