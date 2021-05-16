<template>
    <div class="tabs is-boxed is-small mb-0 has-border-bottom-0" style="padding-top: 7px; height: 39px;">
        <ul>
            <li v-for="tab in tabs" :key="tab.id" :class="isTabActive(tab.id) ? 'is-active' : ''">
                <a class="is-flex is-flex-row is-justify-space-between is-align-center px-2" @click="onClick(tab.id)">
                    <span :class="{ 'mr-1': true, 'is-italic': tab.state === 'preview' }"
                        >{{ noteName(tab.noteId) }}{{ tab.state === 'dirty' ? '*' : '' }}</span
                    >

                    <IconButton
                        icon="fa-times"
                        class="has-text-hover-danger has-text-grey"
                        @click="CLOSE_TAB(tab.id)"
                    />
                </a>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapGetters, mapMutations, mapState, useStore } from 'vuex';
import IconButton from '@/components/core/IconButton.vue';

export default defineComponent({
    setup: (p, c) => {
        const s = useStore();

        const onClick = (tabId: string) => {
            if (s.state.app.editor.activeTab === tabId) {
                s.commit('app/editor/EXIT_PREVIEW', tabId);
            } else {
                s.commit('app/editor/ACTIVE', tabId);
            }
        };

        return {
            onClick
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
