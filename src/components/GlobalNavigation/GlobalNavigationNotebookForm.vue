<template>
    <Form @submit="onSubmit">
        <div class="has-background-light" :style="{ paddingLeft: `${depth * 24}px` }">
            <div class="is-flex is-flex-row is-align-center has-background-light py-1">
                <Field name="Notebook" v-model="inputValue" v-slot="{ field }" :rules="unique">
                    <input
                        type="text"
                        style="min-width: 0; width: 0; flex-grow: 1;"
                        v-bind="field"
                        v-focus
                        @keyup.esc="$emit('cancel')"
                    />

                    <icon-button class="has-text-hover-success" type="submit" icon="fa-check" />

                    <icon-button class="has-text-hover-danger" icon="fa-ban" @click="$emit('cancel')" />
                </Field>
            </div>
            <ErrorMessage name="Notebook" v-slot="{ message }">
                <p class="has-text-danger">{{ message }}</p>
            </ErrorMessage>
        </div>
    </Form>
</template>

<script lang="ts">
import { isBlank } from '@/utils/is-blank';
import { computed, defineComponent, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { Field, ErrorMessage, Form, useForm } from 'vee-validate';
import IconButton from '@/components/IconButton.vue';

export default defineComponent({
    setup(p, c) {
        const s = useStore();

        const input = computed(() => s.state.app.globalNavigation.notebooks.input);

        const inputValue = computed({
            get: () => s.state.app.globalNavigation.notebooks.input?.value,
            set: (v: string) =>
                s.commit('app/UPDATE_STATE', { key: 'globalNavigation.notebooks.input.value', value: v })
        });

        const unique = (v: any) => {
            if (v == null || isBlank(v)) {
                return 'Name cannot be empty';
            }

            const existing = s.state.app.globalNavigation.notebooks.entries.find(
                (t: any) => t.value.toUpperCase() === v.toUpperCase()
            );
            if (existing != null && existing.id !== s.state.app.globalNavigation.notebooks.input.id) {
                return `Notebook with name ${v} already exists`;
            }

            return true;
        };

        const onSubmit = () => {
            c.emit('submit');
        };

        return {
            input,
            inputValue,
            unique,
            onSubmit
        };
    },
    props: {
        depth: {
            type: Number,
            default: 1
        }
    },
    emits: ['submit', 'cancel'],
    components: { Field, ErrorMessage, Form, IconButton }
});
</script>
