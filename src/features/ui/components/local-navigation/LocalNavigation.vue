<template>
    <Resizable v-model="width" id="local-navigation" v-context-menu:localNavigation>
        <UndoContainer undoName="localNavigation" focusName="localNavigation">
            <div class="has-h-100 has-text-dark  is-size-7" style="min-width: 0px;">
                <!-- Header -->
                <!-- <div -->
                <!-- class="is-flex is-flex-grow-1 is-justify-space-between is-align-center has-border-bottom-0 p-1 has-background-light" -->
                <!-- > -->
                <!-- <LocalNavigationSearchBar /> -->
                <!-- <IconButton icon="fa-plus" size="is-small" @click="create" /> -->
                <!-- </div> -->

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
        </UndoContainer>
    </Resizable>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch, WritableComputedRef } from 'vue';
import Resizable from '@/components/Resizable.vue';
// import IconButton from '@/components/buttons/IconButton.vue';
// import LocalNavigationSearchBar from '@/features/ui/components/local-navigation/LocalNavigationSearchBar.vue';
import { mapActions, mapGetters } from 'vuex';
import NavigationMenuItem from '@/components/navigation/NavigationMenuItem.vue';
import NavigationMenuForm from '@/components/navigation/NavigationMenuForm.vue';
import { Note } from '@/features/notes/common/note';
import { useLocalNavigationContextMenu } from './../../hooks/use-local-navigation-context-menu';
import UndoContainer from '@/components/UndoContainer.vue';
import { useLocalNavigation } from '@/features/ui/store/modules/local-navigation';
import { useNotes } from '@/features/notes/store';

export default defineComponent({
    setup: function() {
        const localNav = useLocalNavigation();
        const notes = useNotes();

        const width = computed({
            get: () => localNav.state.width,
            set: localNav.actions.widthUpdated
        });

        const input = computed({
            get: () => localNav.state.notes.input!.name,
            set: localNav.actions.noteInputUpdate
        });

        const formRules = {
            required: true,
            unique: [() => notes.state.values, (n: Note) => n.id, (n: Note) => n.name, () => localNav.state.notes.input]
        };

        useLocalNavigationContextMenu();

        return {
            width,
            input,
            formRules,
            isNoteBeingCreated: computed(() => localNav.getters.isNoteBeingCreated),
            isNoteBeingUpdated: computed(() => localNav.getters.isNoteBeingUpdated),
            activeNotes: computed(() => localNav.getters.activeNotes),
            isActive: computed(() => localNav.getters.isActive),
            confirm: localNav.actions.noteInputConfirm,
            cancel: localNav.actions.noteInputCancel,
            create: localNav.actions.noteInputStart,
            setActive: localNav.actions.setActive
        };
    },
    components: {
        Resizable,
        // LocalNavigationSearchBar,
        // IconButton,
        NavigationMenuItem,
        NavigationMenuForm,
        UndoContainer
    }
});
</script>

<style lang="sass" scoped>
.item-options
    .icon
        height: 12!important
        width: 12px!important
</style>
