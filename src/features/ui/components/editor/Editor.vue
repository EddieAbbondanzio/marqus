<template>
    <div
        id="editor"
        class="has-background-light is-flex-grow-1 is-flex is-flex-column has-text-dark"
        v-focusable:editor
        v-shortcut:undo="undoHandler"
        v-shortcut:redo="redoHandler"
    >
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
import { computed, defineComponent, nextTick, onMounted, Ref, ref } from 'vue';
import EditorTabs from '@/features/ui/components/editor/EditorTabs.vue';
import EditorToolbar from '@/features/ui/components/editor/toolbar/EditorToolbar.vue';
import { store } from '@/store';
import { mapGetters, mapState, useStore } from 'vuex';
import TagInput from '@/components/form/TagInput.vue';
import Dropdown from '@/components/Dropdown.vue';
import MarkdownEditor from '@/features/ui/components/editor/MarkdownEditor.vue';
import MarkdownRenderer from '@/features/ui/components/editor/MarkdownRenderer.vue';
import { focusManager } from '@/directives/focusable';
import { undo } from '@/store/plugins/undo/undo';

export default defineComponent({
    setup: () => {
        const test = () => {
            console.log('TEST!');
        };

        const undoHandler = () => {
            if (focusManager.isFocused('editor')) {
                const m = undo.getModule('editor');

                if (m.canUndo()) {
                    m.undo();
                }
            }
        };

        const redoHandler = () => {
            if (focusManager.isFocused('editor')) {
                const m = undo.getModule('editor');

                if (m.canRedo()) {
                    m.redo();
                }
            }
        };

        return {
            test,
            undoHandler,
            redoHandler
        };
    },
    components: {
        EditorToolbar,
        EditorTabs,
        TagInput,
        Dropdown,
        MarkdownEditor,
        MarkdownRenderer
    },
    computed: {
        ...mapGetters('ui/editor', ['isEmpty', 'activeTab']),
        ...mapState('ui/editor', ['mode', 'isFocus'])
    }
});
</script>

<style lang="sass" scoped>
textarea
    outline: none!important
    border: none!important
    resize: none!important
</style>
