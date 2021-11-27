export interface ContextMenuItem {
  text: string;
  show?: boolean;
  command: string;
}

export interface ContextMenu {
  name: string;
  items: (target: HTMLElement) => ContextMenuItem[];
}
