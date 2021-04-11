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
                        @submit="confirm"
                        @cancel="cancel"
                        v-model="input"
                    />
                </li>
                <li v-for="tag in tags" :key="tag.id" :class="{ 'has-background-light': active == tag.id }">
                    <GlobalNavigationTagForm
                        v-if="isTagBeingUpdated(tag.id)"
                        @submit="confirm"
                        @cancel="cancel"
                        v-model="input"
                    />

                    <a v-else class="no-drag has-text-grey" @click="() => (active = tag.id)">
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
import { store } from '@/store';
import { useStore } from 'vuex';
import Collapse from '@/components/Collapse.vue';
import { useField, Field, ErrorMessage, Form } from 'vee-validate';
import { isBlank } from '@/utils/is-blank';
import GlobalNavigationTagForm from '@/components/GlobalNavigation/GlobalNavigationTagForm.vue';

export default defineComponent({
    setup: function() {
        const s = useStore();

        const tags = computed(() => s.state.app.globalNavigation.tags.entries);

        const tagsExpanded = computed({
            get: () => s.state.app.globalNavigation.tags.expanded,
            set: (v: any) => s.commit('app/globalNavigation/TAGS_EXPANDED', v)
        });

        const isTagBeingUpdated = s.getters['app/globalNavigation/isTagBeingUpdated'];
        const tagInputMode = computed(() => s.state.app.globalNavigation.tags.input.mode);
        const input = computed({
            get: () => s.state.app.globalNavigation.tags.input.value,
            set: (v: string) => s.commit('app/globalNavigation/TAG_INPUT_VALUE', v)
        });

        const active = computed({
            get: () => s.state.app.globalNavigation.active,
            set: (v: any) => s.commit('app/globalNavigation/UPDATE_STATE', { key: 'active', value: v })
        });

        const confirm = () => s.dispatch('app/globalNavigation/tagInputConfirm');
        const cancel = () => s.dispatch('app/globalNavigation/tagInputCancel');

        return {
            tags,
            tagsExpanded,
            confirm,
            cancel,
            store: s,
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
