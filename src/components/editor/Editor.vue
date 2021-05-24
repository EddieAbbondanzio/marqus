<template>
    <div class="has-background-light is-flex-grow-1 is-flex is-flex-column has-text-dark">
        <template v-if="!isEmpty">
            <editor-tabs />
            <editor-toolbar />

            <div class="is-flex is-flex-row is-flex-grow-1">
                <markdown-editor v-if="mode === 'edit' || mode === 'split'" class="is-flex-basis-0 is-flex-grow-1" />
                <markdown-renderer v-if="mode !== 'edit'" class="is-flex-basis-0 is-flex-grow-1" />
            </div>
        </template>
        <div v-else class="is-flex is-align-center is-justify-center is-flex-grow-1 has-w-100">
            <div>
                There's nothing here!
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, ref } from 'vue';
import EditorTabs from '@/components/editor/EditorTabs.vue';
import EditorToolbar from '@/components/editor/toolbar/EditorToolbar.vue';
import { store } from '@/store';
import { mapGetters, mapState, useStore } from 'vuex';
import TagInput from '@/components/core/form/TagInput.vue';
import Dropdown from '@/components/core/Dropdown.vue';
import MarkdownEditor from '@/components/editor/MarkdownEditor.vue';
import MarkdownRenderer from '@/components/editor/MarkdownRenderer.vue';

export default defineComponent({
    components: {
        EditorToolbar,
        EditorTabs,
        TagInput,
        Dropdown,
        MarkdownEditor,
        MarkdownRenderer
    },
    computed: {
        ...mapGetters('app/editor', ['isEmpty', 'activeTab']),
        ...mapState('app/editor', ['mode', 'isFocus'])
    }
});
</script>

<style lang="sass" scoped>
textarea
    outline: none!important
    border: none!important
    resize: none!important
</style>
