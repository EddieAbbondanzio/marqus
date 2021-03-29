<template>
    <Form @submit="() => 1">
        <Field name="Tag" v-model="inputValue" v-slot="{ field }" :rules="unique">
            <input type="text" v-bind="field" @keyup.enter="$emit('submit')" v-focus @keyup.esc="$emit('cancel')" />
            <a
                href="#"
                class="mx-1 has-text-grey has-text-hover-success"
                @click="
                    () => {
                        cat++;
                        $emit('submit');
                    }
                "
            >
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
        <ErrorMessage name="Tag" v-slot="{ message }">
            <p class="has-text-danger">{{ message }}</p>
        </ErrorMessage>
    </Form>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { Field, ErrorMessage, Form } from 'vee-validate';
import { useStore } from 'vuex';
import { isBlank } from '@/utils/is-blank';

export default defineComponent({
    setup() {
        const s = useStore();

        const input = computed(() => s.state.editor.globalNavigation.tags.input);

        const inputValue = computed({
            get: () => s.state.editor.globalNavigation.tags.input?.value,
            set: (v: string) => s.commit('editor/UPDATE_STATE', { key: 'globalNavigation.tags.input.value', value: v })
        });

        const unique = (v: any) => {
            if (v == null || isBlank(v)) {
                return 'Tag cannot be empty';
            }

            const existing = s.state.editor.globalNavigation.tags.entries.find(
                (t: any) => t.value.toUpperCase() === v.toUpperCase()
            );
            if (existing != null && existing.id !== s.state.editor.globalNavigation.tags.input.id) {
                return `Tag with value ${v} already exists`;
            }

            return true;
        };

        return {
            input,
            inputValue,
            unique,
            cat: ref(0)
        };
    },
    emits: ['submit', 'cancel'],
    components: { Field, ErrorMessage, Form }
});
</script>
