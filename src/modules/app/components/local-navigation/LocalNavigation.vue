<template>
    <Resizable v-model="width" data-context-menu="localNavigation" id="local-navigation" v-focusable:localNavigation>
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
import Resizable from '@/common/components/Resizable.vue';
import IconButton from '@/common/components/IconButton.vue';
import LocalNavigationSearchBar from '@/modules/app/components/local-navigation/LocalNavigationSearchBar.vue';
import { mapActions, mapGetters, mapMutations, mapState, useStore } from 'vuex';
import NavigationMenuItem from '@/common/components/navigation/NavigationMenuItem.vue';
import NavigationMenuForm from '@/common/components/navigation/NavigationMenuForm.vue';
import { Note } from '@/modules/notes/common/note';
import { climbDomHierarchy } from '@/common/utils/dom/climb-dom-hierarchy';
import contextMenu from 'electron-context-menu';

export default defineComponent({
    setup: function() {
        const s = useStore();

        const width = computed({
            get: () => s.state.app.localNavigation.width as string,
            set: (w: any) => {
                s.dispatch('app/localNavigation/widthUpdated', w);
            }
        });

        const input = computed({
            get: () => s.state.app.localNavigation.notes.input.name,
            set: (v: string) => s.dispatch('app/localNavigation/noteInputUpdate', v)
        });

        const formRules = {
            required: true,
            unique: [
                () => s.state.notes.values,
                (n: Note) => n.id,
                (n: Note) => n.name,
                () => s.state.app.localNavigation.notes.input
            ]
        };

        let contextMenuRelease: (() => void) | undefined;
        let watchRelease: (() => void) | undefined;

        onMounted(() => {
            watchRelease = s.watch(
                (s) => s.app.globalNavigation.active,
                (val: any) => {
                    console.log(val);
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

                    if (s.state.app.globalNavigation.active !== 'trash') {
                        items.push({
                            label: 'Create Note',
                            click: () => s.dispatch('app/localNavigation/noteInputStart')
                        });
                    }

                    if (id != null) {
                        const note = s.state.notes.values.find((n: Note) => n.id === id) as Note;

                        if (!note.trashed) {
                            items.push({
                                label: 'Edit Note',
                                click: () => s.dispatch('app/localNavigation/noteInputStart', { id })
                            });
                        } else {
                            items.push({
                                label: 'Restore Note',
                                click: () => s.commit('notes/RESTORE_FROM_TRASH', id)
                            });
                        }

                        items.push({
                            label: 'Delete Note',
                            click: () => s.dispatch('app/localNavigation/noteDelete', id)
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

        return {
            width,
            input,
            formRules
        };
    },
    computed: {
        ...mapGetters('app/localNavigation', ['isNoteBeingCreated', 'isNoteBeingUpdated', 'activeNotes', 'isActive'])
    },
    methods: {
        ...mapActions('app/localNavigation', {
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
</style>
