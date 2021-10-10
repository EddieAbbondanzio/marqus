import { notebooks } from "@/store/modules/notebooks";
import { Notebook } from "@/store/modules/notebooks/state";
import { notes } from "@/store/modules/notes";
import { globalNavigation } from "@/store/modules/ui/modules/globalNavigation";
import { Store } from "vuex";
import { Context, Getters } from "vuex-smart-module";
import { LocalNavigationState } from "./state";

export class LocalNavigationGetters extends Getters<LocalNavigationState> {
  globalNav!: Context<typeof globalNavigation>;
  notes!: Context<typeof notes>;
  notebooks!: Context<typeof notebooks>;

  $init(store: Store<any>) {
    this.notes = notes.context(store);
    this.globalNav = globalNavigation.context(store);
    this.notebooks = notebooks.context(store);
  }

  get isNoteBeingCreated() {
    return this.state.notes.input?.mode === "create";
  }

  isNoteBeingUpdated(id: string) {
    return (
      this.state.notes.input?.mode === "update" &&
      this.state.notes.input.id === id
    );
  }

  isActive(id: string) {
    return this.state.active === id;
  }

  get activeNotes() {
    const active = this.globalNav.state.active;

    const notes = this.notes.state.values;

    switch (active?.section) {
      case "all":
        return notes.filter((n) => !n.trashed);

      case "notebook":
        if (active.id == null) {
          return notes.filter(
            (n) => n.notebooks != null && n.notebooks.length > 0 && !n.trashed
          );
        }

        return notes.filter(
          (n) =>
            !n.trashed &&
            n.notebooks != null &&
            n.notebooks.some((id) => {
              let notebook: Notebook | undefined =
                this.notebooks.getters.byId(id);

              // A parent notebook should also show notes for any of it's children.
              while (notebook != null) {
                if (notebook.id === active.id) return true;
                notebook = notebook?.parent;
              }

              return false;
            })
        );

      case "tag":
        if (active.id == null) {
          return notes.filter(
            (n) => !n.trashed && n.tags != null && n.tags.length > 0
          );
        }

        return notes.filter(
          (n) => !n.trashed && (n.tags ?? []).some((tag) => tag === active.id)
        );

      case "favorites":
        return notes.filter((n) => !n.trashed && (n.favorited ?? false));

      case "trash":
        return notes.filter((n) => n.trashed ?? false);

      default:
        return [];
    }
  }
}
