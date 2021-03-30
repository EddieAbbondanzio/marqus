<template>
    <li class="has-text-grey is-size-7">
        <collapse v-model="tagsExpanded" triggerClass="has-background-hover-light">
            <template #trigger>
                <div class="is-flex is-align-center global-navigation-title is-flex-grow-1 has-background-transparent">
                    <span class="icon">
                        <i class="fas fa-tag"></i>
                    </span>
                    <span class="is-size-7 is-uppercase">Tags</span>
                </div>
            </template>

            <ul class="is-size-7">
                <li class="is-flex-grow-1">
                    <GlobalNavigationTagForm
                        v-if="tagInputMode === 'create'"
                        @submit="confirmCreate"
                        @cancel="cancelCreate"
                    />
                </li>
                <li v-for="tag in tags" :key="tag.id" :class="{ 'has-background-light': active == tag.id }">
                    <GlobalNavigationTagForm
                        v-if="isTagBeingUpdated(tag.id)"
                        @submit="confirmUpdate"
                        @cancel="cancelUpdate"
                    />

                    <a v-else class="has-text-grey" @click="() => (active = tag.id)">
                        <p class="global-navigation-tag global-navigation-item" :data-id="tag.id">
                            {{ tag.value }}
                        </p>
                    </a>
                </li>
            </ul>
        </collapse>
    </li>
</template>

<script lang="ts">
import { computed, defineComponent, getCurrentInstance, ref, WritableComputedRef, provide, onMounted } from 'vue';
import { store } from '@/store/store';
import { useStore } from 'vuex';
import Collapse from '@/components/Collapse.vue';
import { useField, Field, ErrorMessage, Form } from 'vee-validate';
import { isBlank } from '@/utils/is-blank';
import GlobalNavigationTagForm from '@/components/GlobalNavigation/GlobalNavigationTagForm.vue';

export default defineComponent({
    setup: function() {
        const s = useStore();

        const confirmCreate = (e: any) => {
            s.dispatch('editor/createTagConfirm');
        };
        const cancelCreate = () => s.dispatch('editor/createTagCancel');

        const tagsExpanded = computed({
            get: () => s.state.editor.globalNavigation.tags.expanded,
            set: (v: any) => s.commit('editor/UPDATE_STATE', { key: 'globalNavigation.tags.expanded', value: v })
        });

        const tags = computed(() => s.state.editor.globalNavigation.tags.entries);

        const confirmUpdate = () => s.dispatch('editor/updateTagConfirm');
        const cancelUpdate = () => s.dispatch('editor/updateTagCancel');

        const isTagBeingUpdated = s.getters['editor/isTagBeingUpdated'];
        const tagInputMode = computed(() => s.state.editor.globalNavigation.tags.input.mode);
        const input = computed({
            get: () => s.state.editor.globalNavigation.tags.input.value,
            set: (v: string) => s.commit('editor/UPDATE_STATE', { key: 'globalNavigation.tags.input.value', value: v })
        });

        const active = computed({
            get: () => s.state.editor.globalNavigation.active,
            set: (v: any) => s.commit('editor/UPDATE_STATE', { key: 'globalNavigation.active', value: v })
        });

        return {
            tags,
            tagsExpanded,
            confirmCreate,
            cancelCreate,
            store: s,
            confirmUpdate,
            cancelUpdate,
            isTagBeingUpdated,
            tagInputMode,
            input,
            active
        };
    },
    components: { Collapse, GlobalNavigationTagForm }
});
</script>

<style lang="sass">
.global-navigation-tag
    padding-left: 24px;
</style>
