<template>
    <Dropdown>
        <template #trigger="{toggle}">
            <button @click="toggle" class="button mb-0 has-text-hover-grey" title="Notebooks" style="height: 30px">
                <span class="icon is-small">
                    <i class="fas fa-book"></i>
                </span>
            </button>
        </template>

        <template #content>
            <TagInput
                :values="notebooks"
                :selected="notebooksForNote(note)"
                @update:selected="onNotebookInput"
                ref="notebookInput"
                placeholder="Type to add notebook"
            />
        </template>
    </Dropdown>
</template>

<script lang="ts">
import { Notebook } from '@/store/modules/notebooks/state';
import { Note } from '@/store/modules/notes/state';
import { defineComponent } from 'vue';
import { mapGetters, mapState, useStore } from 'vuex';
import _ from 'lodash';
import Dropdown from '@/components/core/Dropdown.vue';
import TagInput from '@/components/core/form/TagInput.vue';

export default defineComponent({
    setup() {
        const s = useStore();

        const onNotebookInput = (newNotebooks: Notebook[]) => {
            const note: Note = s.getters['app/editor/activeNote'];
            const oldNotebooks: Notebook[] = s.getters['notebooks/notebooksForNote'](note);
            const delta = oldNotebooks.length - newNotebooks.length;
            let notebook: Notebook;

            switch (delta) {
                case 1:
                    notebook = _.differenceWith(
                        oldNotebooks,
                        newNotebooks,
                        (a: Notebook, b: Notebook) => a.id === b.id
                    )[0];
                    s.commit('notes/REMOVE_NOTEBOOK', { noteId: note.id, notebookId: notebook.id });
                    break;

                case -1:
                    notebook = _.differenceWith(
                        newNotebooks,
                        oldNotebooks,
                        (a: Notebook, b: Notebook) => a.id === b.id
                    )[0];
                    s.commit('notes/ADD_NOTEBOOK', { noteId: note.id, notebookId: notebook.id });
                    break;

                default:
                    throw Error(`Invalid change in notes with delta of: ${delta}`);
            }
        };

        return {
            onNotebookInput
        };
    },
    computed: {
        ...mapGetters('notebooks', {
            notebooks: 'flatten',
            notebooksForNote: 'notebooksForNote'
        }),
        ...mapGetters('app/editor', {
            note: 'activeNote'
        })
    },
    components: {
        Dropdown,
        TagInput
    }
});
</script>
