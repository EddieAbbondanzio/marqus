import { GlobalNavigationState, GlobalNavigationItem } from "./state";
import { Actions, Context } from "vuex-smart-module";
import { GlobalNavigationGetters } from "@/store/modules/ui/modules/globalNavigation/getters";
import { GlobalNavigationMutations } from "@/store/modules/ui/modules/globalNavigation/mutations";
import { tags } from "@/store/modules/tags";
import { notebooks } from "@/store/modules/notebooks";
import { notes } from "@/store/modules/notes";
// import _ from "lodash";
// import { Store } from "vuex";
import { confirmDelete, confirmReplaceNotebook } from "@/prompts";
import { Notebook } from "@/store/modules/notebooks/state";
import { Tag } from "@/store/modules/tags/state";
import { generateId } from "@/utils";
import { InputMode } from "../../state";

export class GlobalNavigationActions extends Actions<
  GlobalNavigationState,
  GlobalNavigationGetters,
  GlobalNavigationMutations,
  GlobalNavigationActions
> {
  tags!: Context<typeof tags>;
  notebooks!: Context<typeof notebooks>;
  notes!: Context<typeof notes>;

  async $init(store: any) {
    this.tags = tags.context(store);
    this.notebooks = notebooks.context(store);
    this.notes = notes.context(store);
  }

  setState(state: GlobalNavigationState) {
    this.commit("SET_STATE", state);
  }

  setActive(a: GlobalNavigationItem) {
    // Stop if we're setting the same item active
    // if (_.isEqual(this.state.active, a)) {
    //   return;
    // }

    this.commit("SET_ACTIVE", a);
  }

  toggleSelected() {
    let notebook: Notebook;

    switch (this.state.selected?.section) {
      case "notebook":
        if (this.state.selected.id == null) {
          this.commit("SET_NOTEBOOKS_EXPANDED", !this.state.notebooks.expanded);
        } else {
          notebook = this.notebooks.getters.byId(this.state.selected.id)!;
          if (notebook.children == null || notebook.children.length === 0) {
            return;
          }

          this.notebooks.commit("SET_EXPANDED", {
            notebook,
            expanded: !notebook.expanded,
            bubbleUp: false,
          });
        }
        break;
      case "tag":
        if (this.state.selected.id == null) {
          this.commit("SET_TAGS_EXPANDED", !this.state.tags.expanded);
        }
        break;
    }
  }

  clearSelected() {
    this.commit("CLEAR_SELECTED");
  }

  moveSelectionUp() {
    const next = this.getters.previousItem();

    // if (!_.isEqual(this.state.selected, next)) {
    //   this.commit("SET_SELECTED", next);
    // }
  }

  moveSelectionDown() {
    const next = this.getters.nextItem();

    // if (!_.isEqual(this.state.selected, next)) {
    //   this.commit("SET_SELECTED", next);
    // }
  }

  setWidth(width: string) {
    this.commit("SET_WIDTH", width);
  }

  setScrollPosition(scrollPos: number) {
    this.commit("SET_SCROLL_POSITION", scrollPos);
  }

  scrollUp(pixels = 30) {
    const newScrollPos = Math.max(this.state.scrollPosition - pixels, 0);
    this.commit("SET_SCROLL_POSITION", newScrollPos);
  }

  scrollDown(pixels = 30) {
    const newScrollPos = Math.max(this.state.scrollPosition + pixels, 0);
    this.commit("SET_SCROLL_POSITION", newScrollPos);
  }

  tagInputStart({ mode, id }: { mode: InputMode; id: string }) {
    // Stop if we already have an input in progress.
    if (this.state.tags.input?.mode != null) {
      return;
    }

    this.commit("SET_TAGS_EXPANDED", true);

    if (mode === "update") {
      const tag = this.tags.getters.byId(id, { required: true });
      this.commit("START_TAGS_INPUT", { mode, id, name: tag.name });
    } else {
      this.commit("START_TAGS_INPUT", { mode, id });
    }
  }

  tagInputUpdated(value: string) {
    if (value === this.state.tags.input?.name) {
      return;
    }

    this.commit("SET_TAGS_INPUT", value);
  }

  tagInputConfirm() {
    // this.undo.group((_undo) => {
    const input = this.state.tags.input;
    let existing: Tag;

    this.commit("SET_TAGS_EXPANDED", true, {});
    switch (input?.mode) {
      case "create":
        this.tags.commit("CREATE", {
          id: generateId(),
          name: input.name,
        });
        break;

      case "update":
        existing = this.tags.getters.byId(input.id, { required: true });
        this.tags.commit("RENAME", { tag: existing, newName: input.name });
        break;
    }
    this.tags.commit("SORT");
    this.commit("CLEAR_TAGS_INPUT");
    // });
    // this.undo.releaseRollbackPoint();
  }

  tagInputCancel() {
    // this.undo.rollback();
    this.commit("CLEAR_TAGS_INPUT", { _undo: { ignore: true } });
  }

  async tagDelete(id: string) {
    const tag = this.tags.getters.byId(id, { required: true });

    if (await confirmDelete("tag", tag.name)) {
      this.tags.commit("DELETE", tag);

      // Find out what notes had the tag so we can cache it.
      // const notesWithTag = this.notes.getters.notesByTag(id);
      this.notes.commit("REMOVE_TAG", { tagId: id });
      // });
    }
  }

  async tagDeleteAll() {
    if (await confirmDelete("every tag", "")) {
      //     await this.undo.group((_undo) => {
      //         // Cache off tags
      //         _undo.cache.tags = [];
      //         for (const tag of this.tags.state.values) {
      //             _undo.cache.tags.push({
      //                 id: tag.id,
      //                 value: tag.name,
      //                 noteIds: this.notes.getters.notesByTag(tag.id).map((n) => n.id)
      //             });
      //         }
      //         this.tags.commit('DELETE_ALL', {
      //             _undo: {
      //                 ..._undo,
      //                 undoCallback: (m) => {
      //                     for (const tag of _undo.cache.tags) {
      //                         this.tags.commit('CREATE', {
      //                             value: { id: tag.id, name: tag.value },
      //                             _undo: { ignore: true }
      //                         });
      //                         this.notes.commit('ADD_TAG', {
      //                             value: { note: tag.noteIds, tagId: tag.id },
      //                             _undo: { ignore: true }
      //                         });
      //                     }
      //                 },
      //                 redoCallback: (m) => {
      //                     this.tags.commit('DELETE_ALL', { _undo: { ignore: true } });
      //                 }
      //             }
      //         });
      //     });
    }
  }

  setTagsExpanded(expanded: boolean) {
    this.commit("SET_TAGS_EXPANDED", expanded);
  }

  notebookInputStart({
    id,
    parentId,
  }: { id?: string; parentId?: string } = {}) {
    // Stop if we already have an input in progress.
    if (this.state.notebooks.input?.mode != null) {
      return;
    }

    let notebook: Notebook | undefined;
    let parent: Notebook | undefined;

    /*
     * id != null -> update
     * id == null -> create, check if we put it under root, or a parent (parentId != null)
     */

    if (id != null) {
      notebook = this.notebooks.getters.byId(id, { required: true });
    }

    if (id == null && parentId != null) {
      parent = this.notebooks.getters.byId(parentId);
    }

    const p: any = {
      type: "notebookInputStarted",
      parentId: parent?.id,
    };

    if (notebook != null) {
      p.notebook = {
        id: notebook.id,
        value: notebook.name,
      };
    }

    // const _undo = { ignore: true };

    // this.commit('START_NOTEBOOKS_INPUT', { value: p, _undo });
    // this.commit('SET_NOTEBOOKS_EXPANDED', { value: true, _undo: { ignore: true } });

    if (parent != null) {
      this.notebooks.commit("SET_EXPANDED", {
        notebook: parent,
        bubbleUp: true,
        expanded: true,
      });
    }
  }

  notebookInputUpdated(value: string) {
    if (value === this.state.notebooks.input?.name) {
      // return;
    }

    // this.commit('SET_NOTEBOOKS_INPUT', { value, _undo: { ignore: true } });
  }

  notebookInputConfirm() {
    // this.undo.group((_undo) => {
    //     const input = this.state.notebooks.input!;
    //     let notebook: NotebookCreate;
    //     let old: Notebook | undefined;
    //     switch (this.state.notebooks.input?.mode) {
    //         case 'create':
    //             notebook = {
    //                 id: generateId(),
    //                 name: input.name,
    //                 expanded: false
    //             };
    //             if (input.parentId != null) {
    //                 notebook.parent = this.notebooks.getters.byId(input.parentId, { required: true });
    //             }
    //             this.notebooks.commit('CREATE', {
    //                 value: notebook,
    //                 _undo: {
    //                     ..._undo,
    //                     undoCallback: (m) => {
    //                         this.notebooks.commit('DELETE', {
    //                             value: m.payload.value,
    //                             _undo: { ignore: true }
    //                         });
    //                         this.commit('SET_NOTEBOOKS_EXPANDED', { value: true, _undo: { ignore: true } });
    //                     },
    //                     redoCallback: (m) => {
    //                         this.notebooks.commit('CREATE', m.payload);
    //                         this.commit('SET_NOTEBOOKS_EXPANDED', { value: true, _undo: { ignore: true } });
    //                     }
    //                 }
    //             });
    //             break;
    //         case 'update':
    //             old = this.notebooks.getters.byId(input.id!)!;
    //             this.notebooks.commit('SET_NAME', {
    //                 value: { notebook: old, newName: input.name },
    //                 _undo: {
    //                     ..._undo,
    //                     cache: {
    //                         oldName: old.name
    //                     },
    //                     undoCallback: (m) => {
    //                         this.notebooks.commit('SET_NAME', {
    //                             value: {
    //                                 notebook: m.payload.value.notebook,
    //                                 newName: m.payload._undo.cache.oldName
    //                             }
    //                         });
    //                         this.commit('SET_NOTEBOOKS_EXPANDED', { value: true, _undo: { ignore: true } });
    //                     },
    //                     redoCallback: (m) => {
    //                         this.notebooks.commit('SET_NAME', {
    //                             value: { notebook: m.payload.value.notebook, newName: m.payload.value.newName }
    //                         });
    //                         this.commit('SET_NOTEBOOKS_EXPANDED', { value: true, _undo: { ignore: true } });
    //                     }
    //                 }
    //             });
    //             break;
    //         default:
    //             throw Error(`Invalid notebook input mode ${this.state.notebooks.input?.mode}`);
    //     }
    //     _undo.ignore = true;
    //     this.commit('CLEAR_NOTEBOOKS_INPUT', { _undo });
    //     this.notebooks.commit('SORT', { _undo });
    // });
  }

  notebookInputCancel() {
    this.commit("CLEAR_NOTEBOOKS_INPUT", { _undo: { ignore: true } });
  }

  async notebookDelete(id: string) {
    const notebook = this.notebooks.getters.byId(id, {
      required: true,
    });

    if (await confirmDelete("notebook", notebook.name)) {
      // this.undo.group((_undo) => {
      // _undo.cache = {
      //     id: notebook.id,
      //     value: notebook.name,
      //     parent: notebook.parent,
      //     children: notebook.children
      // };
      // this.notebooks.commit('DELETE', {
      //     value: notebook,
      //     _undo: {
      //         ..._undo,
      //         cache: {
      //             notebook: notebook
      //         },
      //         undoCallback: (m) => {
      //             this.notebooks.commit('CREATE', {
      //                 value: m.payload._undo.cache.notebook,
      //                 _undo: { ignore: true }
      //             });
      //             this.commit('SET_NOTEBOOKS_EXPANDED', { value: true, _undo: { ignore: true } });
      //         },
      //         redoCallback: (m) => {
      //             this.notebooks.commit('DELETE', m.payload);
      //             this.commit('SET_NOTEBOOKS_EXPANDED', { value: true, _undo: { ignore: true } });
      //         }
      //     }
      // });
      // Find out what notebooks had the tag so we can cache it.
      // const notesWithNotebook = this.notes.getters.notesByNotebook(id);
      // _undo.cache.noteIds = notesWithNotebook.map((n) => n.id);
      // this.notes.commit('REMOVE_NOTEBOOK', {
      //     value: { notebookId: id },
      //     _undo: {
      //         ..._undo,
      //         undoCallback: (m) => {
      //             throw Error('fix');
      //         },
      //         // this.notes.commit('ADD_NOTEBOOK', {
      //         //     value: { noteId: m.payload._undo.cache.noteIds, notebookId: m.payload.value.tagId },
      //         //     _undo: { ignore: true }
      //         // }),,
      //         redoCallback: (m) =>
      //             this.notes.commit('REMOVE_NOTEBOOK', { value: m.payload.value, _undo: { ignore: true } })
      //     }
      // });
      // });
    }
  }

  async notebookDeleteAll() {
    if (await confirmDelete("every notebook", "")) {
      // await this.undo.group((_undo) => {
      //     // Cache off notebooks
      //     _undo.cache.notebooks = [];
      //     for (const notebook of this.notebooks.getters.flatten) {
      //         _undo.cache.notebooks.push({
      //             id: notebook.id,
      //             value: notebook.name,
      //             noteIds: this.notes.getters.notesByNotebook(notebook.id).map((n) => n.id)
      //         });
      //     }
      //     // this.notebooks.commit('DELETE_ALL', {
      //     //     _undo: {
      //     //         ..._undo,
      //     //         undoCallback: (m) => {
      //     //             for (const notebook of _undo.cache.notebooks) {
      //     //                 this.notebooks.commit('CREATE', {
      //     //                     value: { id: notebook.id, name: notebook.value },
      //     //                     _undo: { ignore: true }
      //     //                 });
      //     //                 throw Error('fix');
      //     //                 // this.notes.commit('ADD_NOTEBOOK', {
      //     //                 //     value: { noteId: notebook.noteIds, notebookId: notebook.id },
      //     //                 //     _undo: { ignore: true }
      //     //                 // });
      //     //             }
      //     //         },
      //     //         redoCallback: (m) => {
      //     //             this.notebooks.commit('DELETE_ALL', { _undo: { ignore: true } });
      //     //         }
      //     //     }
      //     // });
      // });
    }
  }

  setNotebooksExpanded(expanded: boolean) {
    // this.commit('SET_NOTEBOOKS_EXPANDED', { value: expanded });
  }

  notebookDragStart(notebook: Notebook) {
    // this.commit('SET_NOTEBOOKS_DRAGGING', { value: notebook.id });
  }

  async notebookDragStop(endedOnId: string | null) {
    const dragging = this.notebooks.getters.byId(
      this.state.notebooks.dragging!
    );

    if (dragging == null) {
      throw new Error("No drag to finalize.");
    }

    let endedOn;
    if (endedOnId != null) {
      endedOn = this.notebooks.getters.byId(endedOnId, {
        notebooks: dragging.children,
      });
    }

    /*
     * Don't allow a move if we started and stopped on the same element, or if
     * we are attempting to move a parent to a child of it.
     */
    if (dragging.id !== endedOnId && endedOn == null) {
      // Remove from old location
      this.notebooks.commit("DELETE", dragging);

      let parent: Notebook | undefined;

      if (endedOnId != null) {
        parent = this.notebooks.getters.byId(endedOnId);
      }

      /*
       * Check for a notebook with the same name in the new destination. If one exists,
       * we'll need to verify with the user that they want to replace it.
       */
      const newSiblings =
        endedOnId == null
          ? this.notebooks.state.values
          : this.notebooks.getters.byId(endedOnId)?.children ?? [];

      const duplicate = newSiblings.find((n) => n.name === dragging.name)!;
      if (duplicate != null) {
        const confirmReplace = await confirmReplaceNotebook(dragging.name);

        if (confirmReplace) {
          this.notebooks.commit("DELETE", duplicate);
        }
      }

      // Insert into new spot
      this.notebooks.commit("CREATE", {
        id: dragging.id,
        name: dragging.name,
        parent,
        children: dragging.children,
        expanded: dragging.expanded,
      });

      if (parent) {
        this.notebooks.commit("SET_EXPANDED", {
          notebook: parent,
          expanded: true,
          bubbleUp: true,
        });
      }

      this.commit("CLEAR_NOTEBOOKS_DRAGGING", {});

      this.notebooks.commit("SORT", {});
    }
  }

  notebookDragCancel() {
    this.commit("CLEAR_NOTEBOOKS_DRAGGING", {});
  }

  expandAll() {
    this.commit("SET_TAGS_EXPANDED", true);
    this.commit("SET_NOTEBOOKS_EXPANDED", true);

    this.notebooks.commit("SET_ALL_EXPANDED", {
      expanded: false,
    });
  }

  collapseAll() {
    this.commit("SET_TAGS_EXPANDED", false);
    this.commit("SET_NOTEBOOKS_EXPANDED", false);

    this.notebooks.commit("SET_ALL_EXPANDED", {
      expanded: false,
    });
  }

  async emptyTrash() {
    if (await confirmDelete("the trash", "permanently")) {
      this.notes.commit("EMPTY_TRASH", {});
    }
  }
}
