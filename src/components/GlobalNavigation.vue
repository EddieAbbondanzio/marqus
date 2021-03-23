<template>
    <resizable class="has-text-dark" v-model="width" @resizeStop="save">
        <ul>
            <li class="m-1 is-uppercase has-text-grey is-size-7">
                <span class="icon">
                    <i class="fas fa-file-alt"></i>
                </span>
                All
            </li>
            <li class="m-1 is-uppercase has-text-grey is-size-7">
                <collapse v-model="isNotebooksExpanded">
                    <template #trigger>
                        <span class="icon">
                            <i class="fas fa-book"></i>
                        </span>
                        Notebooks
                    </template>

                    CONTENT
                </collapse>
            </li>
            <li class="m-1 is-uppercase has-text-grey is-size-7">
                <collapse v-model="isTagsExpanded">
                    <template #trigger>
                        <span class="icon">
                            <i class="fas fa-tag"></i>
                        </span>
                        Tags
                    </template>

                    CONTENT
                </collapse>
            </li>
            <li class="m-1 is-uppercase has-text-grey is-size-7">
                <span class="icon">
                    <i class="fas fa-star"></i>
                </span>
                Favorites
            </li>
            <li class="m-1 is-uppercase has-text-grey is-size-7">
                <span class="icon">
                    <i class="fas fa-trash"></i>
                </span>
                Trash
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
            get: () => s.state.editor['window.globalNavigation.width'] as string,
            set: (v: any) => s.commit('editor/update', { key: 'window.globalNavigation.width', value: v })
        });

        const save = () => s.dispatch('editor/saveState');

        return {
            width,
            save,
            isNotebooksExpanded: ref(true),
            isTagsExpanded: ref(false)
        };
    },
    components: { Resizable, Collapse }
});
</script>
