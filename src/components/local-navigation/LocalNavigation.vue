<template>
    <Resizable v-model="width" @resizeStop="save">
        <div class="has-h-100 has-text-dark  is-size-7">
            <!-- Header -->
            <div
                class="is-flex is-flex-grow-1 is-justify-space-between is-align-center has-border-bottom-1-dark p-1 has-background-light"
            >
                <LocalNavigationSearchBar />
                <IconButton icon="fa-plus" size="is-small" @click="onCreateClick" />
            </div>

            <!-- Files -->
            <div>
                <LocalNavigationNoteForm v-if="isCreatingNote" v-model="input" @submit="confirm" @cancel="cancel" />

                <NavigationMenuList>
                    <NavigationMenuItem
                        v-for="note in notes"
                        :key="note.id"
                        :label="note.name"
                        @click="onNoteClick"
                    ></NavigationMenuItem>
                </NavigationMenuList>
            </div>
        </div>
    </Resizable>
</template>

<script lang="ts">
import { computed, defineComponent, ref, WritableComputedRef } from 'vue';
import Resizable from '@/components/core/Resizable.vue';
import IconButton from '@/components/core/IconButton.vue';
import LocalNavigationSearchBar from '@/components/local-navigation/LocalNavigationSearchBar.vue';
import { mapActions, mapGetters, mapMutations, mapState, useStore } from 'vuex';
import LocalNavigationNoteForm from '@/components/local-navigation/LocalNavigationNoteForm.vue';
import NavigationMenuList from '@/components/core/navigation/NavigationMenuList.vue';
import NavigationMenuItem from '@/components/core/navigation/NavigationMenuItem.vue';

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

        const onCreateClick = () => {
            s.dispatch('app/localNavigation/noteInputStart', null);
        };

        const onNoteClick = () => {
            console.log('click!');
        };

        return {
            width,
            input,
            save,
            onCreateClick,
            onNoteClick
        };
    },
    computed: {
        ...mapGetters('app/localNavigation', ['isCreatingNote']),
        ...mapState('notes', { notes: 'values' })
    },
    methods: {
        ...mapActions('app/localNavigation', {
            confirm: 'noteInputConfirm',
            cancel: 'noteInputCancel'
        })
    },
    components: {
        Resizable,
        LocalNavigationSearchBar,
        IconButton,
        LocalNavigationNoteForm,
        NavigationMenuList,
        NavigationMenuItem
    }
});
</script>
