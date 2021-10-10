export type InputMode = "create" | "update"

export interface Cursor {
    icon: string;
    title?: string;
    dragging?: boolean;
}

export class UserInterfaceState {
    cursor: Cursor = {
      icon: "pointer"
    };
}
