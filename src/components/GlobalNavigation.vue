<template>
    <resizable class="has-text-dark" v-model="width" @resizeStop="save" data-context-menu="globalNavigation">
        <ul>
            <li class="m-1 is-uppercase has-text-grey is-size-7">
                <div class="is-flex is-align-center">
                    <span class="icon">
                        <i class="fas fa-file-alt"></i>
                    </span>
                    <span>All</span>
                </div>
            </li>
            <li class="m-1 is-uppercase has-text-grey is-size-7">
                <collapse v-model="notebooksExpanded">
                    <template #trigger>
                        <div class="is-flex is-align-center">
                            <span class="icon">
                                <i class="fas fa-book"></i>
                            </span>
                            <span>Notebooks</span>
                        </div>
                    </template>

                    CONTENT
                </collapse>
            </li>
            <li class="m-1 is-uppercase has-text-grey is-size-7">
                <collapse v-model="tagsExpanded">
                    <template #trigger>
                        <div class="is-flex is-align-center">
                            <span class="icon">
                                <i class="fas fa-tag"></i>
                            </span>
                            <span>Tags</span>
                        </div>
                    </template>

                    <ul style="margin-left: 24px;">
                        <li class="mb-1" v-if="createTag">
                            <input
                                :value="createTag.value"
                                @input="
                                    (e) =>
                                        store.commit('editor/UPDATE_STATE', {
                                            key: 'globalNavigation.tags.create.value',
                                            value: e.target.value
                                        })
                                "
                                @blur="cancel"
                                @keyup.enter="confirm"
                                @keyup.esc="cancel"
                            />
                        </li>
                        <li class="mb-1" v-for="tag in tags" :key="tag.id">{{ tag.value }}</li>
                    </ul>
                </collapse>
            </li>
            <li class="m-1 is-uppercase has-text-grey is-size-7">
                <div>
                    <span class="icon">
                        <i class="fas fa-star"></i>
                    </span>
                    <span>Favorites</span>
                </div>
            </li>
            <li class="m-1 is-uppercase has-text-grey is-size-7">
                <div>
                    <span class="icon">
                        <i class="fas fa-trash"></i>
                    </span>
                    <span>Trash</span>
                </div>
            </li>
        </ul>
    </resizable>
</template>

<script lang="ts">
import { computed, defineComponent, getCurrentInstance, ref, WritableComputedRef, provide } from 'vue';
import Resizable from '@/components/Resizable.vue';
import { store } from '@/store/store';
import { useStore } from 'vuex';
import Collapse from '@/components/Collapse.vue';

export default defineComponent({
    setup: function() {
        const s = useStore();

        const width = computed({
            get: () => s.state.editor.globalNavigation.width as string,
            set: (v: any) => s.commit('editor/UPDATE_STATE', { key: 'globalNavigation.width', value: v })
        });

        const notebooksExpanded = computed({
            get: () => s.state.editor.globalNavigation.notebooks.expanded,
            set: (v: any) => s.commit('editor/UPDATE_STATE', { key: 'globalNavigation.notebooks.expanded', value: v })
        });

        const tagsExpanded = computed({
            get: () => s.state.editor.globalNavigation.tags.expanded,
            set: (v: any) => s.commit('editor/UPDATE_STATE', { key: 'globalNavigation.tags.expanded', value: v })
        });

        const tags = computed(() => s.state.editor.globalNavigation.tags.entries);
        const createTag = computed(() => s.state.editor.globalNavigation.tags.create);

        const save = () => {
            s.dispatch('editor/save');
        };
        const confirm = () => s.commit('editor/CREATE_TAG_CONFIRM');
        const cancel = () => s.commit('editor/CREATE_TAG_CANCEL');

        return {
            width,
            save,
            notebooksExpanded,
            tagsExpanded,
            tags,
            createTag,
            confirm,
            cancel,
            store: s
        };
    },
    components: { Resizable, Collapse }
});
</script>
