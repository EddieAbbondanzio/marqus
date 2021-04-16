<template>
    <Collapse
        v-if="modelValue.children != null && modelValue.children.length > 0"
        v-model="expanded"
        triggerClass="has-background-hover-light"
    >
        <template #trigger>
            <div class="is-flex-grow-1 has-background-transparent">
                <GlobalNavigationNotebookForm
                    v-if="isNotebookBeingUpdated(modelValue.id)"
                    @submit="confirmUpdate"
                    @cancel="cancelUpdate"
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
                    >
                        {{ modelValue.value }}
                    </p>
                </a>
            </div>
        </template>

        <ul class="is-size-7" v-for="child in modelValue.children" :key="child.id">
            <GlobalNavigationNotebook :modelValue="child" :depth="depth + 1" />
        </ul>
    </Collapse>
    <li v-else class="is-flex-grow-1" :class="{ 'has-background-light': active == modelValue.id }">
        <GlobalNavigationNotebookForm
            v-if="isNotebookBeingUpdated(modelValue.id)"
            @submit="confirmUpdate"
            @cancel="cancelUpdate"
        />
        <a
            v-else
            class="no-drag has-text-grey"
            v-mouse:click="onClick"
            v-mouse:hold="onHold"
            v-mouse:release="onRelease"
        >
            <p
                class="global-navigation-notebook global-navigation-item has-background-hover-light is-flex is-align-center"
                :style="`padding-left: ${depth * 24}px`"
                :data-id="modelValue.id"
            >
                {{ modelValue.value }}
            </p>
        </a>
    </li>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import Collapse from '@/components/Collapse.vue';
import GlobalNavigationNotebookForm from '@/components/GlobalNavigation/GlobalNavigationNotebookForm.vue';
import { mapGetters, useStore } from 'vuex';
import { isBlank } from '@/utils/is-blank';

export default defineComponent({
    props: {
        modelValue: Object
    },
    name: 'GlobalNavigationNotebook',
    setup: function(p, c) {
        const s = useStore();

        const expanded = computed({
            get: () => p.modelValue!.expanded,
            set: (v: any) => s.commit('app/SET_NOTEBOOK_EXPAND', { id: p.modelValue!.id, value: v })
        });

        const notebooks = computed(() => s.state.app.globalNavigation.notebooks.entries);

        const unique = (v: any) => {
            if (v == null || isBlank(v)) {
                return 'Notebook cannot be empty';
            }

            const existing = s.state.app.globalNavigation.tags.entries.find(
                (t: any) => t.value.toUpperCase() === v.toUpperCase()
            );
            if (existing != null) {
                return `Notebook with value ${v} already exists`;
            }

            return true;
        };

        const input = computed(() => s.state.app.globalNavigation.notebooks.input);

        const inputValue = computed({
            get: () => s.state.app.globalNavigation.notebooks.input?.value,
            set: (v: string) =>
                s.commit('app/UPDATE_STATE', { key: 'globalNavigation.notebooks.input.value', value: v })
        });

        const confirmCreate = () => s.dispatch('app/createNotebookConfirm');
        const cancelCreate = () => s.dispatch('app/createNotebookCancel');
        const confirmUpdate = () => s.dispatch('app/updateNotebookConfirm');
        const cancelUpdate = () => s.dispatch('app/updateNotebookCancel');

        const notebookInputMode = computed(() => s.state.app.globalNavigation.notebooks.input.mode);

        const active = computed({
            get: () => s.state.app.globalNavigation.active,
            set: (v: any) => s.commit('app/UPDATE_STATE', { key: 'globalNavigation.active', value: v })
        });

        const onHold = () => {
            s.commit('app/DRAG_NOTEBOOK_START', p.modelValue!);
            s.commit('app/SET_CURSOR_TITLE', p.modelValue!.value);
        };

        const onRelease = (el: HTMLElement, ev: MouseEvent) => {
            s.commit('app/DRAG_NOTEBOOK_STOP', (ev.target as HTMLElement).getAttribute('data-id'));
            s.commit('app/CLEAR_CURSOR_TITLE');
            s.commit('app/SORT_NOTEBOOKS');
        };

        const onClick = () => {
            s.commit('app/UPDATE_STATE', { key: 'globalNavigation.active', value: p.modelValue!.id });
        };

        return {
            expanded,
            notebooks,
            unique,
            confirmCreate,
            cancelCreate,
            confirmUpdate,
            cancelUpdate,
            input,
            inputValue,
            notebookInputMode,
            active,
            onHold,
            onRelease,
            onClick
        };
    },
    computed: {
        ...mapGetters('app/globalNavigation', ['isNotebookBeingUpdated', 'isNotebookBeingCreated'])
    },
    components: { Collapse, GlobalNavigationNotebookForm }
});
</script>

<style lang="sass">
.global-navigation-notebook
    height: 30px;
</style>
