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
                    <TagInput
                        :values="notebooks"
                        :selected="notebooksForNote(note)"
                        @update:selected="onNotebookInput"
                        ref="notebookInput"
                        placeholder="Type to add notebook"
                    />
                </div>
            </div>
        </template>
    </Dropdown>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { mapGetters, mapState, useStore } from 'vuex';
import _ from 'lodash';
import Dropdown from '@/core/components/Dropdown.vue';
import TagInput from '@/core/components/form/TagInput.vue';
import { Notebook } from '@/modules/notebooks/common/notebook';
import { Note } from '@/modules/notes/common/note';
import { Tab } from '@/modules/app/store/modules/editor/state';

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

        const active = computed({
            get: () => {
                const tab: Tab = s.getters['app/editor/activeTab'] as Tab;
                return tab?.notebookDropdownActive ?? false;
            },
            set: (v: boolean) => {
                const tab: Tab = s.getters['app/editor/activeTab'] as Tab;
                s.commit('app/editor/NOTEBOOK_DROPDOWN_ACTIVE', { id: tab.id, active: v });
            }
        });

        const notebookInput = ref(null) as any;

        const onToggle = () => {
            notebookInput.value.focus();
        };

        return {
            active,
            onNotebookInput,
            notebookInput,
            onToggle
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
