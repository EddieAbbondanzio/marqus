<template>
    <Resizable v-model="width" @resizeStop="save" data-context-menu="localNavigation">
        <div class="has-h-100 has-text-dark  is-size-7">
            <!-- Header -->
            <div
                class="is-flex is-flex-grow-1 is-justify-space-between is-align-center has-border-bottom-1-dark p-1 has-background-light"
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

                <template v-for="note in notes" :key="note.id">
                    <NavigationMenuItem
                        v-if="!isNoteBeingUpdated(note.id)"
                        :hideIcon="true"
                        :label="note.name"
                        @click="onNoteClick"
                        indent="0.5rem"
                        :data-id="note.id"
                    ></NavigationMenuItem>
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
import Resizable from '@/components/core/Resizable.vue';
import IconButton from '@/components/core/IconButton.vue';
import LocalNavigationSearchBar from '@/components/local-navigation/LocalNavigationSearchBar.vue';
import { mapActions, mapGetters, mapMutations, mapState, useStore } from 'vuex';
import NavigationMenuItem from '@/components/core/navigation/NavigationMenuItem.vue';
import NavigationMenuForm from '@/components/core/navigation/NavigationMenuForm.vue';
import { Note } from '@/store/modules/notes/state';
import { climbDomHierarchy } from '@/utils/dom/climb-dom-hierarchy';
import contextMenu from 'electron-context-menu';

export default defineComponent({
    setup: function() {
        const s = useStore();

        const width = computed({
            get: () => s.state.app.localNavigation.width as string,
            set: (w: any) => {
                s.commit('app/localNavigation/WIDTH', w);
            }
        });

        const input = computed({
            get: () => s.state.app.localNavigation.notes.input.name,
            set: (v: string) => s.commit('app/localNavigation/NOTE_INPUT_VALUE', v)
        });

        const save = () => s.dispatch('save');

        const onNoteClick = () => {
            console.log('click!');
        };

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
            console.log('watch!');

            contextMenuRelease = contextMenu({
                menu: (_, p) => {
                    const element = document.elementFromPoint(p.x, p.y) as HTMLElement;

                    const id = climbDomHierarchy<string>(element, {
                        match: (el) => el.hasAttribute('data-id'),
                        matchValue: (el) => el.getAttribute('data-id')
                    });

                    // we can inject menu items as needed. This is called each time we right click
                    const items = [
                        {
                            label: 'Create Note',
                            click: () => s.dispatch('app/localNavigation/noteInputStart')
                        }
                    ];

                    if (id != null) {
                        items.push({
                            label: 'Edit Note',
                            click: () => s.dispatch('app/localNavigation/noteInputStart', { id })
                        });

                        items.push({
                            label: 'Delete Note',
                            click: () => s.dispatch('app/localNavigation/noteDelete', id)
                        });
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
            save,
            onNoteClick,
            formRules
        };
    },
    computed: {
        ...mapGetters('app/localNavigation', ['isNoteBeingCreated', 'isNoteBeingUpdated']),
        ...mapState('notes', { notes: 'values' })
    },
    methods: {
        ...mapActions('app/localNavigation', {
            confirm: 'noteInputConfirm',
            cancel: 'noteInputCancel',
            create: 'noteInputStart'
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
