import { notes } from "@/store/modules/notes";
import { Note } from "@/store/modules/notes/state";
import { globalNavigation } from "@/store/modules/ui/modules/global-navigation";
import { LocalNavigationGetters } from "@/store/modules/ui/modules/local-navigation/getters";
import { LocalNavigationMutations } from "@/store/modules/ui/modules/local-navigation/mutations";
import { undo, UndoModule } from "@/store/plugins/undo";
import { confirmDeleteOrTrash } from "@/utils/prompts/confirm-delete-or-trash";
import { ActionTree, Store } from "vuex";
import { Actions, Context } from "vuex-smart-module";
import { LocalNavigationState } from "./state";

export class LocalNavigationActions extends Actions<
  LocalNavigationState,
  LocalNavigationGetters,
  LocalNavigationMutations,
  LocalNavigationActions
> {
  globalNav!: Context<typeof globalNavigation>;
  notes!: Context<typeof notes>;

  undoContext!: UndoModule<any>;

  $init(store: Store<any>) {
    this.globalNav = globalNavigation.context(store);
    this.notes = notes.context(store);

    this.undoContext = undo.getModule({ name: "localNavigation" });
  }

  setActive(id: string) {
    this.commit("SET_ACTIVE", { value: id });
  }

  noteInputStart({ id }: { id?: string } = {}) {
    let note: Note | undefined;

    if (id != null) {
      note = this.notes.getters.byId(id, { required: true });
    }

    let active: any;

    if (
      this.globalNav.state.active?.section === "tag" ||
      this.globalNav.state.active?.section === "notebook"
    ) {
      active = {
        id: this.globalNav.state.active.id,
        type: this.globalNav.state.active.section
      };
    }

    this.commit("START_NOTE_INPUT", {
      value: { note, globalNavigationActive: active },
      _undo: { ignore: true }
    });
  }

  noteInputUpdate(value: string) {
    this.commit("SET_NOTE_INPUT", { value, _undo: { ignore: true } });
  }

  noteInputConfirm() {
    // We group it so we can track
    // this.undoContext.group((_undo) => {
    //     const input = this.state.notes.input!;
    //     let note: Note;
    //     let old: Note | undefined;
    //     switch (input.mode) {
    //         case 'create':
    //             // note = {
    //             //     id: generateId(),
    //             //     dateCreated: new Date(),
    //             //     dateModified: new Date(),
    //             //     name: input.name,
    //             //     notebooks: input.notebooks ?? [],
    //             //     tags: input.tags ?? []
    //             // };
    //             // _undo.cache.note = note;
    //             // this.notes.commit('CREATE', {
    //             //     value: note,
    //             //     _undo: {
    //             //         ..._undo,
    //             //         undoCallback: (ctx) => this.notes.commit('DELETE', { value: ctx.value.id }),
    //             //         redoCallback: (ctx) => ctx.replayMutation()
    //             //     }
    //             // });
    //             break;
    //         case 'update':
    //             old = this.notes.getters.byId(input.id, { required: true });
    //             // _undo.cache.oldName = old.name;
    //             // this.notes.commit('SET_NAME', {
    //             //     value: { note: old, newName: input.name },
    //             //     _undo: {
    //             //         ..._undo,
    //             //         undoCallback: (ctx) =>
    //             //             this.notes.commit('SET_NAME', {
    //             //                 value: { note: ctx.value.note, newName: ctx.cache.oldName }
    //             //             }),
    //             //         redoCallback: (ctx) => ctx.replayMutation()
    //             //     }
    //             // });
    //             break;
    //     }
    //     _undo.ignore = true;
    //     this.commit('CLEAR_NOTE_INPUT', { _undo });
    // });
  }

  noteInputCancel() {
    this.commit("CLEAR_NOTE_INPUT", { _undo: { ignore: true } });
  }

  async noteDelete(id: string) {
    if (id == null) {
      throw Error();
    }

    const note = this.notes.getters.byId(id, { required: true });

    const confirm = await confirmDeleteOrTrash("note", note.name);

    switch (confirm) {
      case "delete":
        // permanent wasn't a joke.
        this.notes.commit("DELETE", note);
        break;

      case "trash":
        // this.undoContext.group((_undo) => {
        //     this.notes.commit('MOVE_TO_TRASH', {
        //         value: note,
        //         _undo: {
        //             ..._undo,
        //             undoCallback: (ctx) =>
        //                 this.notes.commit('RESTORE_FROM_TRASH', { value: ctx.mutation.payload.value }),
        //             redoCallback: (ctx) => ctx.replayMutation()
        //         }
        //     });
        // });
        break;
    }
  }

  widthUpdated(width: string) {
    this.commit("SET_WIDTH", { value: width, _undo: { ignore: true } });
  }
}
