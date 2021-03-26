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
            <global-navigation-tags-section />
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
import { computed, defineComponent, getCurrentInstance, ref, WritableComputedRef, provide, onMounted } from 'vue';
import Resizable from '@/components/Resizable.vue';
import { store } from '@/store/store';
import { useStore } from 'vuex';
import Collapse from '@/components/Collapse.vue';
import { isBlank } from '@/utils/is-blank';
import GlobalNavigationTagsSection from '@/components/GlobalNavigation/GlobalNavigationTagsSection.vue';

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

        const uniqueTags = (v: any) => {
            if (v == null || isBlank(v)) {
                return 'Tag cannot be empty';
            }

            const existing = s.state.editor.globalNavigation.tags.entries.find(
                (t: any) => t.value.toUpperCase() === v.toUpperCase()
            );
            if (existing != null) {
                return `Tag with value ${v} already exists`;
            }

            return true;
        };

        const createTagValue = computed({
            get: () => s.state.editor.globalNavigation.tags.create.value,
            set: (v: string) => s.commit('editor/UPDATE_STATE', { key: 'globalNavigation.tags.create.value', value: v })
        });

        return {
            width,
            save,
            notebooksExpanded,
            tagsExpanded,
            tags,
            createTag,
            confirm,
            cancel,
            store: s,
            createTagValue,
            uniqueTags
        };
    },
    components: { Resizable, Collapse, GlobalNavigationTagsSection }
});
</script>
