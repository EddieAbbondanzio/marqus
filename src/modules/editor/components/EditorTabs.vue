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
import { defineComponent } from 'vue';
import EditorTabItem from '@/modules/editor/components/EditorTabItem.vue';
import { mapGetters, mapState } from 'vuex';

export default defineComponent({
    computed: {
        ...mapState('app/editor', { tabs: (s: any) => s.tabs.values, dragging: (s: any) => s.tabs.dragging }),
        ...mapGetters('app/editor', ['isDragging'])
    },
    components: {
        EditorTabItem
    }
});
</script>
