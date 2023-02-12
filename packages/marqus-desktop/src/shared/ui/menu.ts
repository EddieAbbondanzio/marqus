import { UIEventInput, UIEventType } from "./events";

export type Menu =
  | Separator
  | SubMenu
  | RoleMenu
  | EventMenu<UIEventType>
  | RadioMenu<UIEventType>
  | CheckboxMenu<UIEventType>;

export interface Separator extends BaseMenu {
  type: "separator";
}

export interface SubMenu extends BaseMenu {
  label: string;
  type: "submenu";
  children: Menu[];
}

export interface RoleMenu extends BaseMenu {
  label: string;
  type: "normal";
  shortcut?: string;
  disabled?: boolean;
  role: Electron.MenuItem["role"];
}

export interface EventMenu<Ev extends UIEventType = UIEventType>
  extends BaseMenu {
  label: string;
  type: "normal";
  shortcut?: string;
  disabled?: boolean;
  event: Ev;
  eventInput?: UIEventInput<Ev>;
}

export interface RadioMenu<Ev extends UIEventType = UIEventType>
  extends BaseMenu {
  label: string;
  type: "radio";
  shortcut?: string;
  checked?: boolean;
  disabled?: boolean;
  event: Ev;
  eventInput?: UIEventInput<Ev>;
}

export interface CheckboxMenu<Ev extends UIEventType = UIEventType>
  extends BaseMenu {
  label: string;
  type: "checkbox";
  shortcut?: string;
  checked?: boolean;
  disabled?: boolean;
  event: Ev;
  eventInput?: UIEventInput<Ev>;
}

export interface BaseMenu {
  type: Electron.MenuItem["type"];
  hidden?: boolean;
}

export function isRoleMenu(m: Menu): m is RoleMenu {
  return m.type === "normal" && "role" in m;
}
