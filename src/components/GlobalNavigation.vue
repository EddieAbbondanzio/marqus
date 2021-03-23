<template>
    <resizable class="has-text-dark" v-model="width" @resizeStop="save">
        <ul>
            <li class="m-1 is-uppercase has-text-grey is-size-7">
                <div>
                    <span class="icon">
                        <i class="fas fa-file-alt"></i>
                    </span>
                    All
                </div>
            </li>
            <li class="m-1 is-uppercase has-text-grey is-size-7">
                <collapse v-model="isNotebooksExpanded">
                    <template #trigger>
                        <div>
                            <span class="icon">
                                <i class="fas fa-book"></i>
                            </span>
                            Notebooks
                        </div>
                    </template>

                    CONTENT
                </collapse>
            </li>
            <li class="m-1 is-uppercase has-text-grey is-size-7">
                <collapse v-model="isTagsExpanded">
                    <template #trigger>
                        <div>
                            <span class="icon">
                                <i class="fas fa-tag"></i>
                            </span>
                            Tags
                        </div>
                    </template>

                    CONTENT
                </collapse>
            </li>
            <li class="m-1 is-uppercase has-text-grey is-size-7">
                <div>
                    <span class="icon">
                        <i class="fas fa-star"></i>
                    </span>
                    Favorites
                </div>
            </li>
            <li class="m-1 is-uppercase has-text-grey is-size-7">
                <div>
                    <span class="icon">
                        <i class="fas fa-trash"></i>
                    </span>
                    Trash
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
