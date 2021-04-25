<template>
    <resizable v-model="width" @resizeStop="save">
        <div class="has-h-100 has-text-dark">
            <!-- Header -->
            <div
                class="is-flex is-flex-grow-1 is-justify-space-between is-align-center has-border-bottom-1-dark p-1 has-background-light"
            >
                <local-navigation-search-bar />
                <icon-button icon="fa-plus" size="is-small" @click="onCreateClick" />
            </div>

            <!-- Files -->
            <div>
                <local-navigation-note-form v-if="isCreatingNote" v-model="input" @submit="confirm" @cancel="cancel" />
            </div>
        </div>
    </resizable>
</template>

<script lang="ts">
import { computed, defineComponent, ref, WritableComputedRef } from 'vue';
import Resizable from '@/components/Resizable.vue';
import IconButton from '@/components/IconButton.vue';
import LocalNavigationSearchBar from '@/components/LocalNavigation/LocalNavigationSearchBar.vue';
import { mapActions, mapGetters, useStore } from 'vuex';
import LocalNavigationNoteForm from '@/components/LocalNavigation/LocalNavigationNoteForm.vue';

export default defineComponent({
    setup: function() {
        const s = useStore();

        const width = computed({
            get: () => s.state.app.localNavigation.width as string,
            set: (w: any) => {
                s.commit('app/localNavigation/WIDTH', w);
                s.commit('DIRTY', null, { root: true });
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

        return {
            width,
            input,
            save,
            onCreateClick
        };
    },
    computed: {
        ...mapGetters('app/localNavigation', ['isCreatingNote'])
    },
    methods: {
        ...mapActions('app/localNavigation', {
            confirm: 'noteInputConfirm',
            cancel: 'noteInputCancel'
        })
    },
    components: { Resizable, LocalNavigationSearchBar, IconButton, LocalNavigationNoteForm }
});
</script>
