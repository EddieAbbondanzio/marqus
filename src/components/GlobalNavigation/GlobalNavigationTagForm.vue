<template>
    <!-- If you don't have a submit listener, vee-validate won't .preventDefault() it.-->
    <Form @submit="onSubmit">
        <div class="has-background-light" :style="{ paddingLeft: `${depth * 24}px` }">
            <div class="is-flex is-flex-row has-background-light py-1">
                <Field name="Tag" v-model="inputValue" v-slot="{ field }" :rules="unique">
                    <input
                        type="text"
                        v-bind="field"
                        style="min-width: 0; width: 0; flex-grow: 1;"
                        @keyup.enter="submitForm()"
                        v-focus
                        @keyup.esc="$emit('cancel')"
                    />
                    <icon-button class="has-text-hover-success" type="submit" icon="fa-check" />
                    <icon-button class="has-text-hover-danger" icon="fa-ban" @click="$emit('cancel')" />
                </Field>
            </div>
            <ErrorMessage name="Tag" v-slot="{ message }">
                <p class="has-text-danger">{{ message }}</p>
            </ErrorMessage>
        </div>
    </Form>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { Field, ErrorMessage, Form } from 'vee-validate';
import { useStore } from 'vuex';
import { isBlank } from '@/utils/is-blank';
import IconButton from '@/components/IconButton.vue';

export default defineComponent({
    setup(p, c) {
        const s = useStore();

        const input = computed(() => s.state.app.globalNavigation.tags.input);

        const inputValue = computed({
            get: () => s.state.app.globalNavigation.tags.input?.value,
            set: (v: string) => s.commit('app/UPDATE_STATE', { key: 'globalNavigation.tags.input.value', value: v })
        });

        const unique = (v: any) => {
            if (v == null || isBlank(v)) {
                return 'Tag cannot be empty';
            }

            const existing = s.state.app.globalNavigation.tags.entries.find(
                (t: any) => t.value.toUpperCase() === v.toUpperCase()
            );
            if (existing != null && existing.id !== s.state.app.globalNavigation.tags.input.id) {
                return `Tag with value ${v} already exists`;
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
            onSubmit,
            depth: 1
        };
    },
    emits: ['submit', 'cancel'],
    components: { Field, ErrorMessage, Form, IconButton }
});
</script>
