import {
  GlobalNavigationState,
  GlobalNavigationItem
} from "@/store/modules/ui/modules/global-navigation/state";
import { Mutations } from "vuex-smart-module";

export class GlobalNavigationMutations extends Mutations<
  GlobalNavigationState
> {
  SET_STATE(s: GlobalNavigationState) {
    Object.assign(this.state, s);
  }

  SET_ACTIVE(item: GlobalNavigationItem) {
    this.state.active = item;
  }

  SET_HIGHLIGHT(item: GlobalNavigationItem) {
    this.state.highlight = item;
  }

  CLEAR_HIGHLIGHT() {
    delete this.state.highlight;
  }

  SET_WIDTH(width: string) {
    this.state.width = width;
  }

  SET_SCROLL_POSITION(pixels: number) {
    let value = pixels;

    if (Number.isNaN(value)) {
      value = 0;
    }

    this.state.scrollPosition = value;
  }

  SET_TAGS_EXPANDED(expanded: boolean) {
    this.state.tags.expanded = expanded;
  }

  SET_TAGS_INPUT(value: string) {
    if (this.state.tags.input == null) {
      return;
    }

    this.state.tags.input!.name = value;
  }

  START_TAGS_INPUT(val?: { id: string; value: string }) {
    if (val?.id == null) {
      this.state.tags.input = {
        mode: "create",
        name: ""
      };
    } else {
      this.state.tags.input = {
        mode: "update",
        id: val.id,
        name: val.value
      };
    }
  }

  CLEAR_TAGS_INPUT() {
    delete this.state.tags.input;
  }

  SET_NOTEBOOKS_EXPANDED(expanded: boolean) {
    this.state.notebooks.expanded = expanded;
  }

  SET_NOTEBOOKS_INPUT(value: string) {
    if (this.state.notebooks.input == null) {
      return;
    }

    this.state.notebooks.input!.name = value;
  }

  START_NOTEBOOKS_INPUT(p: {
    notebook?: { id: string; value: string };
    parentId?: string;
  }) {
    if (p.notebook != null) {
      this.state.notebooks.input = {
        mode: "update",
        id: p.notebook.id,
        name: p.notebook.value,
        parentId: p.parentId
      };
    } else {
      this.state.notebooks.input = {
        mode: "create",
        name: "",
        parentId: p.parentId
      };
    }
  }

  CLEAR_NOTEBOOKS_INPUT() {
    delete this.state.notebooks.input;
  }

  SET_NOTEBOOKS_DRAGGING(id: string) {
    this.state.notebooks.dragging = id;
  }

  CLEAR_NOTEBOOKS_DRAGGING() {
    delete this.state.notebooks.dragging;
  }
}
