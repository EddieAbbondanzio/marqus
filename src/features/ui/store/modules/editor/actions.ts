import { EditorState, EditorMode, Tab } from '@/features/ui/store/modules/editor/state';
import { Note } from '@/features/notes/common/note';
import { confirmDeleteOrTrash, fileSystem } from '@/shared/utils';
import { Actions, Context } from 'vuex-smart-module';
import { loadNoteContentFromFileSystem, saveNoteContent } from '@/features/notes/utils/persist';
import { EditorGetters } from '@/features/ui/store/modules/editor/getters';
import { EditorMutations } from '@/features/ui/store/modules/editor/mutations';
import { notes } from '@/features/notes/store';
import { Store } from 'vuex';

export class EditorActions extends Actions<EditorState, EditorGetters, EditorMutations, EditorActions> {
    notes!: Context<typeof notes>;

    $init(store: Store<any>) {
        this.notes = notes.context(store);
    }

    tabDragStart(tab: Tab) {
        const _undo = { ignore: true };
        this.commit('SET_ACTIVE', { value: tab.id, _undo }); // We set it as active, so it renders nicely on the cursor
        this.commit('SET_TABS_DRAGGING', { value: tab, _undo });
    }

    tabDragStop(newIndex: number) {
        this.commit('MOVE_TAB', { value: newIndex });
        this.commit('SET_TABS_DRAGGING', { value: undefined, _undo: { ignore: true } });
    }

    async tabOpen(noteId: string) {
        const content = await loadNoteContentFromFileSystem(noteId);
        this.commit('OPEN_TAB', { value: { noteId, content, preview: true } });
    }

    async saveTab(noteId: string) {
        const tab = this.getters.byNoteId(noteId, { required: true });

        await saveNoteContent(tab.noteId, tab.content);
        this.commit('SET_TAB_STATE', { value: { tab, state: 'normal' }, _undo: { ignore: true } });
    }

    tabSwitch(tabId: string) {
        this.commit('SET_ACTIVE', { value: tabId });
    }

    async deleteActiveNote() {
        const activeNote = this.getters.activeNote;

        if (activeNote == null) {
            return;
        }

        const confirm = await confirmDeleteOrTrash('note', activeNote.name);

        switch (confirm) {
            case 'delete':
                this.notes.commit('DELETE', { value: activeNote.id });
                break;

            case 'trash':
                this.notes.commit('MOVE_TO_TRASH', { value: activeNote.id });
                break;
        }
    }

    toggleMode() {
        if (this.state.mode === 'split') {
            return;
        }

        switch (this.state.mode) {
            case 'readonly':
                this.commit('SET_EDITOR_MODE', { value: 'edit' });
                break;

            case 'edit':
                this.commit('SET_EDITOR_MODE', { value: 'readonly' });
                break;
        }
    }
}
