<template>
    <li
        :key="modelValue.id"
        :class="isTabActive(modelValue.id) ? 'is-active' : ''"
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

export default defineComponent({
    props: {
        modelValue: Object,
        index: Number
    },
    setup: (p, c) => {
        const s = useStore();

        const onClick = (tabId: string) => {
            if (s.state.app.editor.activeTab === tabId) {
                s.commit('app/editor/EXIT_PREVIEW', tabId);
            } else {
                s.commit('app/editor/ACTIVE', tabId);
            }
        };

        const onMoveStart = () => {
            s.dispatch('app/editor/tabDragStart', p.modelValue!);
        };

        const onMoveEnd = (e: MouseEvent) => {
            const endedOnElement = document.elementFromPoint(e.x, e.y);

            console.log(endedOnElement);
            s.dispatch('app/editor/tabDragStop');
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
