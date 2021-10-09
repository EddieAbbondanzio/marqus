import { notebooks } from "@/store/modules/notebooks";
import { Notebook } from "@/store/modules/notebooks/state";
import { tags } from "@/store/modules/tags";
import { Store } from "vuex";
import { Context, Getters } from "vuex-smart-module";
import { GlobalNavigationState, GlobalNavigationItem } from "./state";

export class GlobalNavigationGetters extends Getters<GlobalNavigationState> {
  notebooks!: Context<typeof notebooks>;
  tags!: Context<typeof tags>;

  $init(store: Store<any>) {
    this.notebooks = notebooks.context(store);
    this.tags = tags.context(store);
  }

  isActive(active: GlobalNavigationItem) {
    switch (this.state.active?.section) {
    case "all":
    case "favorites":
    case "trash":
      return active.section === this.state.active.section;
    case "notebook":
    case "tag":
      return (
        active.section === this.state.active.section &&
          active.id === this.state.active.id
      );
    default:
      return false;
    }
  }

  isSelected(item: GlobalNavigationItem) {
    if (this.state.selected == null) {
      return false;
    }

    return (
      item.section === this.state.selected.section &&
      (item as any).id === (this.state.selected as any).id
    );
  }

  previousItem(): GlobalNavigationItem {
    if (this.state.selected == null) {
      return { section: "all" };
    }

    const previous = this.state.selected;
    let next;

    switch (previous.section) {
    case "all":
      return { section: "all" };

    case "trash":
      return { section: "favorites" };

    case "favorites":
      if (this.state.tags.expanded) {
        next = this.tags.getters.last();
        return { section: "tag", id: next.id };
      } else {
        return { section: "tag" };
      }

      // eslint-disable-next-line no-fallthrough
    case "tag":
      if (previous.id != null) {
        next = this.tags.getters.getPrevious(previous.id);

        if (next == null) {
          return { section: "tag" };
        } else {
          return { section: "tag", id: next.id };
        }
      } else {
        if (this.state.notebooks.expanded) {
          next = this.notebooks.getters.last();
          return { section: "notebook", id: next!.id };
        } else {
          return { section: "notebook" };
        }
      }

      // eslint-disable-next-line no-fallthrough
    case "notebook":
      if (previous.id != null && previous.section === "notebook") {
        next = this.notebooks.getters.getPrevious(previous.id);

        if (next == null) {
          return { section: "notebook" };
        } else {
          return { section: "notebook", id: next.id };
        }
      } else {
        return { section: "all" };
      }

      // eslint-disable-next-line no-fallthrough
    default:
      return { section: "all" };
    }
  }

  nextItem(): GlobalNavigationItem {
    // Start at the top
    if (this.state.selected == null) {
      return { section: "all" };
    }

    const previous = this.state.selected;
    let next;

    /*
     * This is not the best approach. There's probably a better design out there but it feels better to rig it
     * up for now until the global navigation supports re-ordering sections.
     */

    switch (previous.section) {
    case "all":
      return { section: "notebook" };

    case "notebook":
      if (previous.id == null) {
        next = this.notebooks.getters.first();
      } else {
        next = this.notebooks.getters.getNext(previous.id);
      }

      if (next != null && this.state.notebooks.expanded) {
        return { section: "notebook", id: next.id };
      } else {
        return { section: "tag" };
      }

    case "tag":
      if (previous.id == null) {
        next = this.tags.getters.first();
      } else {
        next = this.tags.getters.getNext(previous.id);
      }

      if (next != null && this.state.tags.expanded) {
        return { section: "tag", id: next.id };
      } else {
        return { section: "favorites" };
      }

    case "favorites":
    case "trash":
      return { section: "trash" };

    default:
      return { section: "all" };
    }
  }

  indentation(depth: number) {
    return `${depth * 24}px`;
  }

  get isTagBeingCreated() {
    return this.state.tags.input?.mode === "create";
  }

  isTagBeingUpdated(id: string) {
    return (
      this.state.tags.input?.mode === "update" &&
      this.state.tags.input.id === id
    );
  }

  isNotebookBeingCreated(parentId: string | null) {
    // Check to see if we are even in create mode first
    if (this.state.notebooks.input?.mode !== "create") {
      return false;
    }

    // Now check to see if we're testing for a root notebook create
    if (parentId == null) {
      return this.state.notebooks.input?.parentId == null;
    }

    // Lastly, test for a nested notebook create
    if (parentId != null) {
      return this.state.notebooks.input?.parentId === parentId;
    }

    // If we somehow got here, halt and catch fire.
    throw Error();
  }

  isNotebookBeingUpdated(id: string) {
    return (
      this.state.notebooks.input?.mode === "update" &&
      this.state.notebooks.input.id === id
    );
  }

  get isNotebookBeingDragged() {
    return this.state.notebooks.dragging != null;
  }

  canNotebookBeCollapsed(n: Notebook) {
    return (n.children?.length ?? 0) > 0;
  }
}
