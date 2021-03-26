<template>
    <li class="m-1 has-text-grey is-size-7">
        <collapse v-model="tagsExpanded">
            <template #trigger>
                <div class="is-flex is-align-center">
                    <span class="icon">
                        <i class="fas fa-tag"></i>
                    </span>
                    <span class="is-size-7 is-uppercase">Tags</span>
                </div>
            </template>

            <ul class="is-size-7" style="margin-left: 24px;">
                <li class="mb-1">
                    <Form @submit="confirmCreate" v-slot="{ submitForm }" v-if="input.mode === 'create'">
                        <Field name="Tag" v-model="inputValue" v-slot="{ field }" :rules="uniqueTags">
                            <input type="text" v-bind="field" v-focus @keyup.esc="cancelCreate" />
                            <a href="#" class="mx-1 has-text-grey has-text-hover-success" @click="submitForm">
                                <span class="icon is-small">
                                    <i class="fas fa-check" />
                                </span>
                            </a>
                            <a href="#" class="has-text-grey has-text-hover-danger" @click="cancelCreate">
                                <span class="icon is-small">
                                    <i class="fas fa-ban" />
                                </span>
                            </a>
                        </Field>
                        <ErrorMessage name="Tag" v-slot="{ message }">
                            <p class="has-text-danger">{{ message }}</p>
                        </ErrorMessage>
                    </Form>
                </li>
                <li class="global-navigation-tag mb-1" v-for="tag in tags" :key="tag.id">
                    <Form
                        v-if="input.mode == 'update' && input.id === tag.id"
                        @submit="confirmUpdate"
                        v-slot="{ submitForm }"
                    >
                        <Field name="Tag" v-model="inputValue" v-slot="{ field }" :rules="uniqueTags">
                            <input type="text" v-bind="field" v-focus @keyup.esc="cancelUpdate" />
                            <a href="#" class="mx-1 has-text-grey has-text-hover-success" @click="submitForm">
                                <span class="icon is-small">
                                    <i class="fas fa-check" />
                                </span>
                            </a>
                            <a href="#" class="has-text-grey has-text-hover-danger" @click="cancelUpdate">
                                <span class="icon is-small">
                                    <i class="fas fa-ban" />
                                </span>
                            </a>
                        </Field>
                        <ErrorMessage name="Tag" v-slot="{ message }">
                            <p class="has-text-danger">{{ message }}</p>
                        </ErrorMessage>
                    </Form>
                    <p v-else class="global-navigation-tag" :data-id="tag.id">{{ tag.value }}</p>
                </li>
            </ul>
        </collapse>
    </li>
</template>

<script lang="ts">
import { computed, defineComponent, getCurrentInstance, ref, WritableComputedRef, provide, onMounted } from 'vue';
import { store } from '@/store/store';
import { useStore } from 'vuex';
import Collapse from '@/components/Collapse.vue';
import { useField, Field, ErrorMessage, Form } from 'vee-validate';
import { isBlank } from '@/utils/is-blank';

export default defineComponent({
    setup: function() {
        const s = useStore();

        const input = computed(() => s.state.editor.globalNavigation.tags.input);

        const confirmCreate = () => s.commit('editor/CREATE_TAG_CONFIRM');
        const cancelCreate = () => s.commit('editor/CREATE_TAG_CANCEL');

        const uniqueTags = (v: any) => {
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

        const inputValue = computed({
            get: () => s.state.editor.globalNavigation.tags.input?.value,
            set: (v: string) => s.commit('editor/UPDATE_STATE', { key: 'globalNavigation.tags.input.value', value: v })
        });

        const tagsExpanded = computed({
            get: () => s.state.editor.globalNavigation.tags.expanded,
            set: (v: any) => s.commit('editor/UPDATE_STATE', { key: 'globalNavigation.tags.expanded', value: v })
        });

        const tags = computed(() => s.state.editor.globalNavigation.tags.entries);

        const confirmUpdate = () => s.commit('editor/UPDATE_TAG_CONFIRM');
        const cancelUpdate = () => s.commit('editor/UPDATE_TAG_CANCEL');

        return {
            tags,
            tagsExpanded,
            input,
            confirmCreate,
            cancelCreate,
            store: s,
            inputValue,
            uniqueTags,
            confirmUpdate,
            cancelUpdate
        };
    },
    components: { Collapse, Field, ErrorMessage, Form }
});
</script>
