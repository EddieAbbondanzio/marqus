<template>
    <!-- If you don't have a submit listener, vee-validate won't .preventDefault() it.-->
    <Form @submit="() => 1">
        <div class="has-background-light" :style="{ paddingLeft: `${depth * 24}px` }">
            <div class="is-flex is-flex-row">
                <Field name="Notebook" v-model="inputValue" v-slot="{ field }" :rules="unique">
                    <input
                        type="text"
                        v-bind="field"
                        @keyup.enter="$emit('submit')"
                        v-focus
                        @keyup.esc="$emit('cancel')"
                    />
                    <a href="#" class="mx-1 has-text-grey has-text-hover-success" @click="$emit('submit')">
                        <span class="icon is-small">
                            <i class="fas fa-check" />
                        </span>
                    </a>
                    <a href="#" class="has-text-grey has-text-hover-danger" @click="$emit('cancel')">
                        <span class="icon is-small">
                            <i class="fas fa-ban" />
                        </span>
                    </a>
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
import { Field, ErrorMessage, Form } from 'vee-validate';

export default defineComponent({
    setup(p) {
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

        return {
            input,
            inputValue,
            unique
        };
    },
    props: {
        depth: {
            type: Number,
            default: 1
        }
    },
    emits: ['submit', 'cancel'],
    components: { Field, ErrorMessage, Form }
});
</script>
