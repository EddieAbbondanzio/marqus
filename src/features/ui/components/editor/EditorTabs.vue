<template>
    <div
        id="editor-tabs"
        class="tabs is-boxed is-small mb-0 has-border-bottom-0"
        style="padding-top: 7px; height: 39px;"
    >
        <ul>
            <EditorTabItem v-for="(tab, i) in tabs" :key="tab.id" :modelValue="tab" :index="i" />
        </ul>
    </div>

    <Teleport to="#cursor-dragging" v-if="isDragging">
        <div class="tabs is-boxed is-small mb-0 has-border-bottom-0" style="padding-top: 7px; height: 39px; ">
            <ul>
                <EditorTabItem :modelValue="dragging" />
            </ul>
        </div>
    </Teleport>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import EditorTabItem from '@/features/ui/components/editor/EditorTabItem.vue';
import { mapGetters, mapState } from 'vuex';
import { useEditor } from '@/features/ui/store/modules/editor';

export default defineComponent({
    setup() {
        const editor = useEditor();

        return {
            tabs: computed(() => editor.state.tabs.values),
            dragging: computed(() => editor.state.tabs.dragging),
            isDragging: computed(() => editor.getters.isDragging)
        };
    },
    components: {
        EditorTabItem
    }
});
</script>
