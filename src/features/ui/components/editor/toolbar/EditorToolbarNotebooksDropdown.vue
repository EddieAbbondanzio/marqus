<template>
    <Dropdown v-model:active="active">
        <template #trigger="{toggle}">
            <button
                @click="
                    (e) => {
                        toggle(e);
                        onToggle();
                    }
                "
                class="button mb-0 has-text-hover-grey"
                title="Notebooks"
                style="height: 30px"
            >
                <span class="icon is-small">
                    <i class="fas fa-book"></i>
                </span>
            </button>
        </template>

        <template #menu>
            <div class="dropdown-menu p-0">
                <div class="dropdown-content p-0">
                    <!-- <TagInput
                        :values="notebooks"
                        :selected="notebooksForNote(note)"
                        @update:selected="onNotebookInput"
                        @blur="() => (active = false)"
                        ref="notebookInput"
                        placeholder="Type to add notebook"
                        :createEnabled="true"
                        createName="notebook"
                    /> -->
                </div>
            </div>
        </template>
    </Dropdown>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { mapGetters, mapState, useStore } from 'vuex';
import _ from 'lodash';
import Dropdown from '@/components/Dropdown.vue';
import { Notebook } from '@/features/notebooks/common/notebook';
import { Note } from '@/features/notes/common/note';
import { Tab } from '@/features/ui/store/modules/editor/state';
import { useEditor } from '@/features/ui/store/modules/editor';
import { useNotebooks } from '@/features/notebooks/store';
import { useNotes } from '@/features/notes/store';

export default defineComponent({
    setup() {
        const editor = useEditor();
        const notebooks = useNotebooks();
        const notes = useNotes();

        const onNotebookInput = (newNotebooks: Notebook[]) => {
            const note = editor.getters.activeNote!;

            const oldNotebooks = notebooks.getters.notebooksForNote(note);
            const delta = oldNotebooks.length - newNotebooks.length;
            let notebook: Notebook;

            switch (delta) {
                case 1:
                    [notebook] = _.differenceWith(
                        oldNotebooks,
                        newNotebooks,
                        (a: Notebook, b: Notebook) => a.id === b.id
                    );

                    notes.actions.removeNotebook({ noteId: note.id, notebookId: notebook.id });
                    break;

                case -1:
                    [notebook] = _.differenceWith(
                        newNotebooks,
                        oldNotebooks,
                        (a: Notebook, b: Notebook) => a.id === b.id
                    );
                    notes.actions.addNotebook({ noteId: note.id, notebookId: notebook.id });
                    break;
            }
        };

        const active = computed({
            get: () => editor.getters.activeTab?.notebookDropdownVisible ?? false,
            set: editor.actions.setNotebooksDropdownVisible
        });

        const notebookInput = ref(null) as any;

        const onToggle = () => notebookInput.value.focus();

        return {
            active,
            onNotebookInput,
            notebookInput,
            onToggle,
            notebooks: computed(() => notebooks.getters.flatten),
            notebooksForNote: computed(() => notebooks.getters.notebooksForNote),
            note: computed(() => editor.getters.activeNote)
        };
    },
    components: {
        Dropdown
    }
});
</script>
