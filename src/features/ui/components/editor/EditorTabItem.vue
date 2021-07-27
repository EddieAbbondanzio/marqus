<template>
    <li
        :key="modelValue.id"
        :class="isTabActive(modelValue.id) ? 'editor-tab is-active' : 'editor-tab'"
        :title="noteName(modelValue.noteId)"
        :data-index="index"
    >
        <a
            class="is-flex is-flex-row is-justify-space-between is-align-center px-2"
            v-mouse:click.left="() => onClick(modelValue.id)"
            v-mouse:hold.left="onMoveStart"
            v-mouse:release.left="onMoveEnd"
        >
            <span :class="{ 'editor-tab-label': true, 'mr-1': true, 'is-italic': modelValue.state === 'preview' }"
                >{{ noteName(modelValue.noteId) }}{{ modelValue.state === 'dirty' ? '*' : '' }}</span
            >

            <IconButton
                title="Close"
                icon="fa-times"
                class="has-text-hover-danger has-text-grey"
                @click.stop="closeTab(modelValue.id)"
            />
        </a>
    </li>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { mapGetters, mapMutations, mapState, useStore } from 'vuex';
import IconButton from '@/components/IconButton.vue';
import { climbDomHierarchy } from '@/shared/utils';
import { useEditor } from '@/features/ui/store/modules/editor';
import { Tab } from '@/features/ui/store/modules/editor/state';

export default defineComponent({
    props: {
        modelValue: Object,
        index: Number
    },
    setup: (p) => {
        const editor = useEditor();

        const onClick = (tabId: string) => editor.actions.openTab(tabId);

        const onMoveStart = () => editor.actions.tabDragStart(p.modelValue as Tab);

        const onMoveEnd = (e: MouseEvent) => {
            const endedOnElement = document.elementFromPoint(e.x, e.y) as HTMLElement;
            const tabContainer = climbDomHierarchy(endedOnElement, {
                match: (e) => e.id === 'editor-tabs',
                matchValue: (e) => e
            });

            // If we can't find the tab container, we didn't finish our drag within it. Stop.
            if (tabContainer == null) {
                return;
            }

            const endedAtXPositioned = e.offsetX;
            const tabs = document.querySelectorAll('#editor-tabs .editor-tab');

            let tabIndex = 0;
            let tabXPosition = 0;

            // Find the index of the last tab to the left of the drag end position based off local x coordinate.
            while (tabXPosition < endedAtXPositioned && tabs.length > tabIndex) {
                const tab = tabs.item(tabIndex) as HTMLElement;
                const box = tab.getBoundingClientRect();

                tabXPosition += box.width;
                tabIndex++;
            }

            // Gotta minus 1 since the loop incremented preemptively.
            tabIndex--;

            editor.actions.tabDragStop(tabIndex);
        };

        return {
            onClick,
            onMoveStart,
            onMoveEnd,
            closeTab: editor.actions.closeTab,
            tabs: computed(() => editor.state.tabs),
            noteName: editor.getters.noteName,
            isTabActive: editor.getters.isTabActive
        };
    },
    components: { IconButton }
});
</script>

<style lang="sass" scoped>
.editor-tab-label
    max-width: 120px
    overflow: hidden
    text-overflow: ellipsis
</style>
