<template>
    <!-- Root, or mid level notebook with children -->
    <Collapse v-if="canNotebookBeCollapsed(modelValue)" v-model="expanded" triggerClass="has-background-hover-light">
        <!-- Expand / Collapse trigger -->
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
                    @mouseover="onHover"
                >
                    <p
                        :class="[
                            'global-navigation-notebook',
                            'global-navigation-item',
                            { 'has-background-light': active == modelValue.id },
                            'is-flex is-align-center'
                        ]"
                        :data-id="modelValue.id"
                        :style="{ 'padding-left': indentation(notebookDepth(modelValue)) }"
                    >
                        {{ modelValue.value }}
                    </p>
                </a>
            </div>
        </template>

        <!-- Root, or mid level notebook children -->
        <div class="is-size-7">
            <GlobalNavigationNotebookForm
                v-if="isNotebookBeingCreated(modelValue.id)"
                @submit="confirm"
                @cancel="cancel"
                v-model="input"
            />
            <GlobalNavigationNotebook v-for="child in modelValue.children" :key="child.id" :modelValue="child" />
        </div>
    </Collapse>
    <!-- Leaf Notebook -->
    <div v-else class="is-flex-grow-1" :class="{ 'has-background-light': active == modelValue.id }">
        <!-- Form to update notebook -->
        <GlobalNavigationNotebookForm
            v-if="isNotebookBeingUpdated(modelValue.id)"
            @submit="confirm"
            @cancel="cancel"
            v-model="input"
        />
        <!-- Notebook value -->
        <a
            v-else
            class="no-drag has-text-grey"
            v-mouse:click.left="onClick"
            v-mouse:hold.left="onHold"
            v-mouse:release.left="onRelease"
            @mouseover="onHover"
        >
            <p
                class="global-navigation-notebook global-navigation-item has-background-hover-light is-flex is-align-center"
                :data-id="modelValue.id"
                :style="{ 'padding-left': indentation(notebookDepth(modelValue)) }"
            >
                {{ modelValue.value }}
            </p>
        </a>
        <GlobalNavigationNotebookForm
            v-if="isNotebookBeingCreated(modelValue.id)"
            @submit="confirm"
            @cancel="cancel"
            v-model="input"
        />
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
            set: (v: any) => {
                s.commit('app/globalNavigation/NOTEBOOK_EXPANDED', {
                    notebook: p.modelValue,
                    expanded: v,
                    bubbleUp: false
                });
                s.commit('DIRTY', null, { root: true });
            }
        });

        const active = computed({
            get: () => s.state.app.globalNavigation.active,
            set: (v: any) => s.commit('app/globalNavigation/ACTIVE', v)
        });

        const onClick = () => {
            s.commit('app/globalNavigation/ACTIVE', !p.modelValue!.expanded);
        };

        const input = computed({
            get: () => s.state.app.globalNavigation.notebooks.input.value,
            set: (v: string) => s.commit('app/globalNavigation/NOTEBOOK_INPUT_VALUE', v)
        });

        const onHold = () => {
            s.dispatch('app/globalNavigation/notebookDragStart', p.modelValue!);
        };

        const onRelease = (ev: any) => {
            const id = ev.target.getAttribute('data-id');
            s.dispatch('app/globalNavigation/notebookDragStop', id);
        };

        const onHover = () => {
            if (s.state.app.globalNavigation.notebooks.dragging && !p.modelValue!.expanded) {
                s.commit('app/globalNavigation/NOTEBOOK_EXPANDED', {
                    notebook: p.modelValue!,
                    expanded: true,
                    bubbleUp: false
                });
            }
        };

        return {
            expanded,
            active,
            onClick,
            input,
            onHold,
            onRelease,
            onHover
        };
    },
    computed: {
        ...mapGetters('app/globalNavigation', [
            'isNotebookBeingUpdated',
            'isNotebookBeingCreated',
            'indentation',
            'canNotebookBeCollapsed',
            'notebookDepth'
        ])
    },
    methods: {
        ...mapActions('app/globalNavigation', {
            confirm: 'notebookInputConfirm',
            cancel: 'notebookInputCancel',
            onRelease: 'notebookDragStop'
        })
    },
    components: { Collapse, GlobalNavigationNotebookForm }
});
</script>

<style lang="sass">
.global-navigation-notebook
    height: 30px;
</style>
