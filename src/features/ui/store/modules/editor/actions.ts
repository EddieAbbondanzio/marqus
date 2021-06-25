import { Editor, EditorMode, Tab } from '@/features/app/store/modules/editor/state';
import { Note } from '@/features/notes/common/note';
import { NOTES_DIRECTORY } from '@/features/notes/store';
import { State } from '@/store/state';
import { fileSystem } from '@/utils/file-system';
import { confirmDeleteOrTrash } from '@/utils/prompts/confirm-delete-or-trash';
import path from 'path';
import { ActionTree } from 'vuex';

export const actions: ActionTree<Editor, State> = {
    tabDragStart({ commit }, tab: Tab) {
        commit('ACTIVE', tab.id); // We set it as active, to render it nicer on cursor dragging
        commit('TAB_DRAGGING', tab);
    },
    tabDragStop({ commit }, newIndex: number) {
        commit('TAB_DRAGGING_NEW_INDEX', newIndex);
        commit('TAB_DRAGGING');
    },
    async tabOpen({ commit }, noteId: string) {
        const content = await loadNoteContentFromFileSystem(noteId);
        commit('OPEN_TAB', { noteId, content });
    },
    async saveTab({ commit, state }, noteId: string) {
        const tab = state.tabs.values.find((t) => t.noteId === noteId)!;

        await saveNoteContent(tab.noteId, tab.content);
        commit('TAB_STATE', { tab, state: 'clean' });
    },
    tabSwitch({ commit }, tabId: string) {
        commit('SWITCH_TAB', tabId);
    },
    async deleteActiveNote({ commit, rootState, rootGetters }) {
        const { id } = rootGetters['app/editor/activeNote'] as Note;
        const note = rootState.notes.values.find((n) => n.id === id);

        if (note == null) {
            throw Error(`No note with id ${id} found.`);
        }

        const confirm = await confirmDeleteOrTrash('note', note.name);

        switch (confirm) {
            case 'delete':
                commit('notes/DELETE', id, { root: true });
                break;

            case 'trash':
                commit('notes/MOVE_TO_TRASH', id, { root: true });
                break;
        }
    },
    toggleMode({ commit, state }) {
        let newMode: EditorMode;

        switch (state.mode) {
            case 'readonly':
                newMode = 'edit';
                break;

            case 'edit':
                newMode = 'readonly';
                break;
            case 'split':
                newMode = state.mode;
                break;
        }

        commit('MODE', newMode);
    }
};

export async function loadNoteContentFromFileSystem(noteId: string) {
    return await fileSystem.readText(path.join(NOTES_DIRECTORY, noteId, 'index.md'));
}

export async function saveNoteContent(noteId: string, content: string) {
    await fileSystem.writeText(path.join(NOTES_DIRECTORY, noteId, 'index.md'), content);
}
