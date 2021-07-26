import { notes } from '@/features/notes/store';
import { Store } from 'vuex';
import { Context, Getters } from 'vuex-smart-module';
import { EditorState, Tab } from './state';

export class EditorGetters extends Getters<EditorState> {
    notes!: Context<typeof notes>;

    $init(store: Store<any>) {
        this.notes = notes.context(store);
    }

    get activeNote() {
        if (this.state.tabs.active == null) {
            return null;
        }

        const activeTab = this.state.tabs.values.find((t) => t.id === this.state.tabs.active);

        if (activeTab == null) {
            return null;
        }

        return this.notes.state.values.find((n) => n.id === activeTab.noteId);
    }

    get activeTab() {
        if (this.state.tabs.active == null) {
            return null;
        } else {
            return this.state.tabs.values.find((t) => t.id === this.state.tabs.active);
        }
    }

    noteName(noteId: string) {
        const note = this.notes.getters.byId(noteId);
        return note?.name ?? '';
    }

    isTabActive(tabId: string) {
        if (this.state.tabs.active == null) {
            return false;
        }

        return this.state.tabs.active === tabId;
    }

    byNoteId(id: string): Tab | undefined;
    byNoteId(id: string, opts: { required: true }): Tab;
    byNoteId(noteId: string, opts?: { required: boolean }) {
        console.log(this.state);
        const tab = this.state.tabs.values.find((t) => t.noteId === noteId);

        if (opts?.required && tab == null) {
            throw Error(`No tab with note id ${noteId} found.`);
        }

        return tab;
    }

    get isDragging() {
        return this.state.tabs.dragging != null;
    }

    get isEmpty() {
        return this.state.tabs.values.length === 0;
    }
}
