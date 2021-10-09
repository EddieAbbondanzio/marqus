import { Base } from "@/store/base";

export type TabState = "preview" | "normal" | "dirty";

export interface Tab extends Base {
  noteId: string;
  state: TabState;
  content: string;
  tagDropdownVisible?: boolean;
  notebookDropdownVisible?: boolean;
}

export type EditorMode = "readonly" | "edit" | "split";

export class EditorState {
  tabs: {
    active?: string;
    dragging?: Tab;
    values: Tab[];
  } = {
    values: []
  };

  mode: EditorMode = "readonly";

  isFocus?: boolean;
}
