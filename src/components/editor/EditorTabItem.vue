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
                @click="CLOSE_TAB(modelValue.id)"
            />
        </a>
    </li>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapGetters, mapMutations, mapState, useStore } from 'vuex';
import IconButton from '@/components/core/IconButton.vue';
import { climbDomHierarchy } from '@/utils/dom/climb-dom-hierarchy';
import { off } from 'node:process';

export default defineComponent({
    props: {
        modelValue: Object,
        index: Number
    },
    setup: (p, c) => {
        const s = useStore();

        const onClick = (tabId: string) => {
            if (s.state.app.editor.tabs.active === tabId) {
                s.commit('app/editor/EXIT_PREVIEW', tabId);
            } else {
                s.commit('app/editor/ACTIVE', tabId);
            }
        };

        const onMoveStart = () => {
            s.dispatch('app/editor/tabDragStart', p.modelValue!);
        };

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

            s.dispatch('app/editor/tabDragStop', tabIndex);
        };

        return {
            onClick,
            onMoveStart,
            onMoveEnd
        };
    },
    methods: {
        ...mapMutations('app/editor', ['CLOSE_TAB'])
    },
    computed: {
        ...mapState('app/editor', ['tabs']),
        ...mapGetters('app/editor', ['noteName', 'isTabActive'])
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
