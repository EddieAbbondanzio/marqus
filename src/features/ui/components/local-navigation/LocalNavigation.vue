<template>
    <Resizable
        v-model="width"
        data-context-menu="localNavigation"
        id="local-navigation"
        v-focusable:localNavigation
        v-shortcut:undo="onUndo"
        v-shortcut:redo="onRedo"
    >
        <div class="has-h-100 has-text-dark  is-size-7" style="min-width: 0px;">
            <!-- Header -->
            <div
                class="is-flex is-flex-grow-1 is-justify-space-between is-align-center has-border-bottom-0 p-1 has-background-light"
            >
                <LocalNavigationSearchBar />
                <IconButton icon="fa-plus" size="is-small" @click="create" />
            </div>

            <!-- Files -->
            <div>
                <NavigationMenuForm
                    v-if="isNoteBeingCreated"
                    v-model="input"
                    @submit="confirm"
                    @cancel="cancel"
                    :rules="formRules"
                    fieldName="Note"
                    indent="0.5rem"
                />

                <template v-for="note in activeNotes" :key="note.id">
                    <NavigationMenuItem
                        v-if="!isNoteBeingUpdated(note.id)"
                        :hideIcon="true"
                        :label="note.name"
                        :title="note.name"
                        :active="isActive(note.id)"
                        @click="() => setActive(note.id)"
                        indent="0.5rem"
                        :data-id="note.id"
                    >
                        <template #options>
                            <div class="item-options">
                                <span class="icon has-text-grey-lighter mr-2" v-if="note.favorited">
                                    <i class="fas fa-star"></i>
                                </span>
                                <span v-else>&nbsp;</span>
                            </div>
                        </template>
                    </NavigationMenuItem>
                    <NavigationMenuForm
                        v-else
                        @submit="confirm"
                        @cancel="cancel"
                        v-model="input"
                        fieldName="Note"
                        :rules="formRules"
                        indent="0.5rem"
                    />
                </template>
            </div>
        </div>
    </Resizable>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, WritableComputedRef } from 'vue';
import Resizable from '@/components/Resizable.vue';
import IconButton from '@/components/IconButton.vue';
import LocalNavigationSearchBar from '@/features/ui/components/local-navigation/LocalNavigationSearchBar.vue';
import { mapActions, mapGetters, mapMutations, mapState, useStore } from 'vuex';
import NavigationMenuItem from '@/components/navigation/NavigationMenuItem.vue';
import NavigationMenuForm from '@/components/navigation/NavigationMenuForm.vue';
import { Note } from '@/features/notes/common/note';
import { climbDomHierarchy } from '@/utils/dom/climb-dom-hierarchy';
import contextMenu from 'electron-context-menu';
import { focusManager } from '@/directives/focusable';
import { undo } from '@/store/plugins/undo/undo';

export default defineComponent({
    setup: function() {
        const s = useStore();

        const width = computed({
            get: () => s.state.ui.localNavigation.width as string,
            set: (w: any) => {
                s.dispatch('ui/localNavigation/widthUpdated', w);
            }
        });

        const input = computed({
            get: () => s.state.ui.localNavigation.notes.input.name,
            set: (v: string) => s.dispatch('ui/localNavigation/noteInputUpdate', v)
        });

        const formRules = {
            required: true,
            unique: [
                () => s.state.notes.values,
                (n: Note) => n.id,
                (n: Note) => n.name,
                () => s.state.ui.localNavigation.notes.input
            ]
        };

        let contextMenuRelease: (() => void) | undefined;
        let watchRelease: (() => void) | undefined;

        onMounted(() => {
            watchRelease = s.watch(
                (s) => s.ui.globalNavigation.active,
                (val: any) => {
                    // console.log(val);
                }
            );
            contextMenuRelease = contextMenu({
                menu: (_, p) => {
                    const element = document.elementFromPoint(p.x, p.y) as HTMLElement;

                    const id = climbDomHierarchy<string>(element, {
                        match: (el) => el.hasAttribute('data-id'),
                        matchValue: (el) => el.getAttribute('data-id')
                    });

                    // we can inject menu items as needed. This is called each time we right click
                    const items = [] as any[];

                    if (s.state.ui.globalNavigation.active !== 'trash') {
                        items.push({
                            label: 'Create Note',
                            click: () => s.dispatch('ui/localNavigation/noteInputStart')
                        });
                    }

                    if (id != null) {
                        const note = s.state.notes.values.find((n: Note) => n.id === id) as Note;

                        if (!note.trashed) {
                            items.push({
                                label: 'Edit Note',
                                click: () => s.dispatch('ui/localNavigation/noteInputStart', { id })
                            });
                        } else {
                            items.push({
                                label: 'Restore Note',
                                click: () => s.commit('notes/RESTORE_FROM_TRASH', id)
                            });
                        }

                        items.push({
                            label: 'Delete Note',
                            click: () => s.dispatch('ui/localNavigation/noteDelete', id)
                        });

                        if (!note.favorited) {
                            items.push({
                                label: 'Favorite',
                                click: () => s.commit('notes/FAVORITE', id)
                            });
                        } else {
                            items.push({
                                label: 'Unfavorite',
                                click: () => s.commit('notes/UNFAVORITE', id)
                            });
                        }
                    }

                    return items;
                },
                shouldShowMenu: (e, p) => {
                    const element = document.elementFromPoint(p.x, p.y) as HTMLElement;

                    const menuName = climbDomHierarchy(element, {
                        match: (el) => el.hasAttribute('data-context-menu'),
                        matchValue: (el) => el.getAttribute('data-context-menu')
                    });

                    return menuName === 'localNavigation';
                }
            });
        });

        onBeforeUnmount(() => {
            contextMenuRelease!();
            watchRelease!();
        });

        const onUndo = () => {
            if (focusManager.isFocused('localNavigation')) {
                const m = undo.getModule('localNavigation');

                if (m.canUndo()) {
                    m.undo();
                }
            }
        };

        const onRedo = () => {
            if (focusManager.isFocused('localNavigation')) {
                const m = undo.getModule('localNavigation');

                if (m.canRedo()) {
                    m.redo();
                }
            }
        };

        return {
            width,
            input,
            formRules,
            onUndo,
            onRedo
        };
    },
    computed: {
        ...mapGetters('ui/localNavigation', ['isNoteBeingCreated', 'isNoteBeingUpdated', 'activeNotes', 'isActive'])
    },
    methods: {
        ...mapActions('ui/localNavigation', {
            confirm: 'noteInputConfirm',
            cancel: 'noteInputCancel',
            create: 'noteInputStart',
            setActive: 'setActive'
        })
    },
    components: {
        Resizable,
        LocalNavigationSearchBar,
        IconButton,
        NavigationMenuItem,
        NavigationMenuForm
    }
});
</script>

<style lang="sass" scoped>
.item-options
    .icon
        height: 12!important
        width: 12px!important

#local-navigation
    outline: none!important
    border: none!important
    resize: none!important
</style>
