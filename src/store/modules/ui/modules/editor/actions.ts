/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  EditorState,
  Tab
} from "@/store/modules/ui/modules/editor/state";
import { Actions, Context } from "vuex-smart-module";
import { EditorGetters } from "@/store/modules/ui/modules/editor/getters";
import { EditorMutations } from "@/store/modules/ui/modules/editor/mutations";
import { notes } from "@/store/modules/notes";
import { Store } from "vuex";
import { undo, UndoModule } from "@/store/plugins/undo";
import { tags } from "@/store/modules/tags";
import { notebooks } from "@/store/modules/notebooks";
import { confirmDelete } from "@/prompts";
// import { loadNoteContent, saveNoteContent } from "@/store/modules/notes/plugins";

export class EditorActions extends Actions<
  EditorState,
  EditorGetters,
  EditorMutations,
  EditorActions
> {
  notes!: Context<typeof notes>;
  tags!: Context<typeof tags>;
  notebooks!: Context<typeof notebooks>;

  undoContext!: UndoModule<any>;

  $init(store: Store<any>) {
    this.notes = notes.context(store);
    this.tags = tags.context(store);
    this.notebooks = notebooks.context(store);
    this.undoContext = undo.getModule({ name: "editor" });
  }

  setState(state: EditorState) {
    this.commit("SET_STATE", state);
  }

  createTag(t: { id: string; name: string }) {
    // this.tags.commit('CREATE', {
    //     value: t,
    //     _undo: {
    //         undoCallback: (m) => {
    //             this.tags.commit('DELETE', { value: m.payload.value.id });
    //         },
    //         redoCallback: (m) => {
    //             this.tags.commit('CREATE', { value: m.payload.value });
    //         }
    //     }
    // });
  }

  createNotebook(n: { id: string; name: string }) {
    // this.notebooks.commit('CREATE', {
    //     value: n,
    //     _undo: {
    //         undoCallback: (m) => {
    //             this.notebooks.commit('DELETE', { value: m.payload.value.id });
    //         },
    //         redoCallback: (m) => {
    //             this.notebooks.commit('CREATE', { value: m.payload.value });
    //         }
    //     }
    // });
  }

  tabDragStart(tab: Tab) {
    const _undo = { ignore: true };
    this.commit("SET_ACTIVE", { value: tab.id, _undo }); // We set it as active, so it renders nicely on the cursor
    this.commit("SET_TABS_DRAGGING", { value: tab, _undo });
  }

  tabDragStop(newIndex: number) {
    this.commit("MOVE_TAB", { value: newIndex });
    this.commit("SET_TABS_DRAGGING", {
      value: undefined,
      _undo: { ignore: true }
    });
  }

  tabDragCancel() {
    this.commit("SET_TABS_DRAGGING", {
      value: undefined,
      _undo: { ignore: true }
    });
  }

  async openTab(noteId: string) {
    const existing = this.getters.byNoteId(noteId);

    if (existing != null) {
      // If tab is already open, and in preview, exit preview mode.
      if (existing.state === "preview") {
        this.commit("SET_TAB_STATE", {
          value: { tab: existing, state: "normal" }
        });
      }

      this.commit("SET_ACTIVE", { value: existing.id });
    } else {
      const content = ""; // await loadNoteContent(noteId);

      this.commit("OPEN_TAB", {
        value: {
          noteId,
          content,
          preview: true
        }
      });
    }
  }

  async saveTab(noteId: string) {
    const tab = this.getters.byNoteId(noteId, { required: true });

    // await saveNoteContent(tab.noteId, tab.content);
    // this.commit("SET_TAB_STATE", {
    //   value: { tab, state: "normal" },
    //   _undo: { ignore: true }
    // });
  }

  closeTab(tabId: string) {
    const tab = this.getters.byId(tabId, { required: true });
    this.commit("CLOSE_TAB", { value: tab.id });
  }

  async deleteActiveNote() {
    const activeNote = this.getters.activeNote;

    if (activeNote == null) {
      return;
    }

    // TODO: This is redundant logic. See local navigation deleteNote action. Figure out how to commonize it.
    const confirm = await confirmDelete("note", activeNote.name, { showTrash: true });

    switch (confirm) {
    case "delete":
      // permanent wasn't a joke.
      this.notes.commit("DELETE", activeNote);
      break;

    case "trash":
      // this.undoContext.group((_undo) => {
      //     this.notes.commit('MOVE_TO_TRASH', {
      //         value: activeNote,
      //         _undo: {
      //             ..._undo,
      //             undoCallback: (m) => this.notes.commit('RESTORE_FROM_TRASH', { value: m.payload.value }),
      //             redoCallback: (m) => this.notes.commit('MOVE_TO_TRASH', { value: m.payload.value })
      //         }
      //     });
      // });
      break;
    }
  }

  setNotebooksDropdownVisible(visible: boolean) {
    const tab = this.getters.activeTab!;
    this.commit("SET_NOTEBOOK_DROPDOWN_VISIBLE", { value: { tab, visible } });

    if (tab.tagDropdownVisible) {
      this.commit("SET_TAG_DROPDOWN_VISIBLE", {
        value: { tab, visible: false }
      });
    }
  }

  setTagsDropdownVisible(visible: boolean) {
    const tab = this.getters.activeTab!;
    this.commit("SET_TAG_DROPDOWN_VISIBLE", { value: { tab, visible } });

    if (tab.notebookDropdownVisible) {
      this.commit("SET_NOTEBOOK_DROPDOWN_VISIBLE", {
        value: { tab, visible: false }
      });
    }
  }

  setTabContent(content: string) {
    const tab = this.getters.activeTab!;
    this.commit("SET_TAB_CONTENT", { value: { tab, content } });
  }

  toggleMode() {
    if (this.state.mode === "split") {
      return;
    }

    switch (this.state.mode) {
    case "readonly":
      this.commit("SET_EDITOR_MODE", { value: "edit" });
      break;

    case "edit":
      this.commit("SET_EDITOR_MODE", { value: "readonly" });
      break;
    }
  }
}
