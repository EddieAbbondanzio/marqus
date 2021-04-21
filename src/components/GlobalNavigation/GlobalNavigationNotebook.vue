<template>
    <Collapse v-if="canNotebookBeCollapsed(modelValue)" v-model="expanded" triggerClass="has-background-hover-light">
        <template #trigger>
            <div class="is-flex-grow-1 has-background-transparent">
                <GlobalNavigationNotebookForm
                    v-if="isNotebookBeingUpdated(modelValue.id)"
                    @submit="confirm"
                    @cancel="cancel"
                    v-model="input"
                />
                <a
                    v-else
                    class="no-drag has-text-grey"
                    v-mouse:click.left="onClick"
                    v-mouse:hold.left="onHold"
                    v-mouse:release.left="onRelease"
                >
                    <p
                        :class="[
                            'global-navigation-notebook',
                            'global-navigation-item',
                            { 'has-background-light': active == modelValue.id },
                            'is-flex is-align-center'
                        ]"
                        :data-id="modelValue.id"
                        :style="{ 'padding-left': indentation(getNotebookDepth(modelValue)) }"
                    >
                        {{ modelValue.value }}
                    </p>
                </a>
            </div>
        </template>

        <ul class="is-size-7">
            <GlobalNavigationNotebook v-for="child in modelValue.children" :key="child.id" :modelValue="child" />
            <GlobalNavigationNotebookForm
                v-if="isNotebookBeingCreated(modelValue.id)"
                @submit="confirm"
                @cancel="cancel"
                v-model="input"
            />
        </ul>
    </Collapse>
    <div v-else class="is-flex-grow-1" :class="{ 'has-background-light': active == modelValue.id }">
        <GlobalNavigationNotebookForm
            v-if="isNotebookBeingUpdated(modelValue.id)"
            @submit="confirm"
            @cancel="cancel"
            v-model="input"
        />
        <a
            v-else
            class="no-drag has-text-grey"
            v-mouse:click.left="onClick"
            v-mouse:hold.left="onHold"
            v-mouse:release.left="onRelease"
        >
            <p
                class="global-navigation-notebook global-navigation-item has-background-hover-light is-flex is-align-center"
                :data-id="modelValue.id"
                :style="{ 'padding-left': indentation(getNotebookDepth(modelValue)) }"
            >
                {{ modelValue.value }}
            </p>
        </a>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import Collapse from '@/components/Collapse.vue';
import GlobalNavigationNotebookForm from '@/components/GlobalNavigation/GlobalNavigationNotebookForm.vue';
import { mapActions, mapGetters, useStore } from 'vuex';
import { Notebook } from '@/store/modules/notebooks/state';

export default defineComponent({
    props: {
        modelValue: Object
    },
    name: 'GlobalNavigationNotebook',
    setup: function(p, c) {
        const s = useStore();

        const expanded = computed({
            get: () => p.modelValue!.expanded,
            set: (v: any) => s.commit('app/globalNavigation/NOTEBOOK_EXPANDED', { notebook: p.modelValue, expanded: v })
        });

        const active = computed({
            get: () => s.state.app.globalNavigation.active,
            set: (v: any) => s.commit('app/globalNavigation/ACTIVE', v)
        });

        const onHold = () => {
            // s.commit('app/DRAG_NOTEBOOK_START', p.modelValue!);
            // s.commit('app/SET_CURSOR_TITLE', p.modelValue!.value);
        };

        const onRelease = (el: HTMLElement, ev: MouseEvent) => {
            // s.commit('app/DRAG_NOTEBOOK_STOP', (ev.target as HTMLElement).getAttribute('data-id'));
            // s.commit('app/CLEAR_CURSOR_TITLE');
            // s.commit('app/SORT_NOTEBOOKS');
        };

        const onClick = () => {
            s.commit('app/globalNavigation/ACTIVE', !p.modelValue!.expanded);
        };

        const getNotebookDepth = (n: Notebook) => {
            let count = 1;
            let c: Notebook = n;

            while (c.parent != null) {
                c = c.parent;
                count++;
            }

            return count;
        };

        const input = computed({
            get: () => s.state.app.globalNavigation.notebooks.input.value,
            set: (v: string) => s.commit('app/globalNavigation/NOTEBOOK_INPUT_VALUE', v)
        });

        return {
            expanded,
            active,
            onHold,
            onRelease,
            onClick,
            getNotebookDepth,
            input
        };
    },
    computed: {
        ...mapGetters('app/globalNavigation', [
            'isNotebookBeingUpdated',
            'isNotebookBeingCreated',
            'indentation',
            'canNotebookBeCollapsed'
        ])
    },
    methods: {
        ...mapActions('app/globalNavigation', { confirm: 'notebookInputConfirm', cancel: 'notebookInputCancel' })
    },
    components: { Collapse, GlobalNavigationNotebookForm }
});
</script>

<style lang="sass">
.global-navigation-notebook
    height: 30px;
</style>
