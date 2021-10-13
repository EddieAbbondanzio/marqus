export type InputMode = "create" | "update";

export interface Cursor {
  icon: string;
  title?: string;
  dragging?: boolean;
}

export interface Focusable {
  id: string;
  directiveElement: HTMLElement;
  name?: string;
  hidden?: boolean;
  focusElement: HTMLElement;
  querySelector?: string;
}

export class UserInterfaceState {
  cursor: Cursor = {
    icon: "pointer",
  };

  active?: Focusable;
  focusables: Focusable[] = [];
}
