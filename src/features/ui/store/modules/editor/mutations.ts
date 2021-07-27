import { generateId } from '@/store';
import { EditorMode, EditorState, Tab, TabState } from '@/features/ui/store/modules/editor/state';
import { MutationTree } from 'vuex';
import { Mutations } from 'vuex-smart-module';
import { UndoPayload, VoidUndoPayload } from '@/store/plugins/undo';

export class EditorMutations extends Mutations<EditorState> {
    SET_STATE(s: EditorState) {
        Object.assign(this.state, s);
        console.log(s);
    }

    SET_ACTIVE(p: UndoPayload<string>) {
        this.state.tabs.active = p.value;
    }

    SET_EDITOR_MODE(p: UndoPayload<EditorMode>) {
        this.state.mode = p.value;
    }

    SET_NOTEBOOK_DROPDOWN_VISIBLE({ value: { tab, visible } }: UndoPayload<{ tab: Tab; visible: boolean }>) {
        tab.notebookDropdownVisible = visible;
    }

    SET_TAG_DROPDOWN_VISIBLE({ value: { tab, visible } }: UndoPayload<{ tab: Tab; visible: boolean }>) {
        tab.tagDropdownVisible = visible;
    }

    SET_TAB_CONTENT(p: UndoPayload<{ tab: Tab; content: string }>) {
        p.value.tab.content = p.value.content;
        p.value.tab.state = 'dirty';
    }

    SET_TAB_STATE(p: UndoPayload<{ tab: Tab; state: TabState }>) {
        p.value.tab.state = p.value.state;
    }

    CLOSE_TAB(p: UndoPayload<string>) {
        const index = this.state.tabs.values.findIndex((t) => t.id === p.value);

        if (index === -1) throw Error('No tab to close');

        this.state.tabs.values.splice(index, 1);

        // Switch out of edit mode if no tabs left open
        if (this.state.tabs.values.length === 0) {
            this.state.mode = 'readonly';
        }
    }

    CLOSE_ALL_TABS(p: VoidUndoPayload) {
        this.state.tabs.values.length = 0;
        delete this.state.tabs.active;
    }

    SET_TABS_DRAGGING(p: UndoPayload<Tab | undefined>) {
        if (p.value == null) {
            delete this.state.tabs.dragging;
        } else {
            this.state.tabs.dragging = p.value;
        }
    }

    MOVE_TAB(p: UndoPayload<number>) {
        if (this.state.tabs.dragging == null) {
            return;
        }

        const oldIndex = this.state.tabs.values.findIndex((t) => t.id === this.state.tabs.dragging!.id);

        // Remove from old spot
        const [tab] = this.state.tabs.values.splice(oldIndex, 1);

        // Insert into new one
        this.state.tabs.values.splice(p.value, 0, tab);
    }

    OPEN_TAB(p: UndoPayload<{ noteId: string; content: string; preview: boolean }>) {
        // See if we already opened the tab
        const existing = this.state.tabs.values.find((t) => t.noteId === p.value.noteId);

        if (existing != null) {
            // Switch it to normal mode if it was a preview
            if (existing.state === 'preview' && this.state.tabs.active === existing.id) {
                existing.state = 'normal';
            }

            return;
        }

        // TODO: Move this to action
        const tab: Tab = {
            id: generateId(),
            content: p.value.content,
            noteId: p.value.noteId,
            state: p.value.preview ? 'preview' : 'normal'
        };

        const existingPreviewTabIndex = this.state.tabs.values.findIndex((t) => t.state === 'preview');

        // When opening a new preview tab, and one already exists, replace it.
        if (p.value.preview && existingPreviewTabIndex !== -1) {
            this.state.tabs.values.splice(existingPreviewTabIndex, 1, tab);
        } else {
            this.state.tabs.values.push(tab);
        }

        // Set newly opened tab to active
        this.state.tabs.active = tab.id;
    }
}
