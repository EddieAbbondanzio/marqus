import { CommandName } from "@/commands";
import { KeyCode } from "./key-code";
import { GENERAL_USE_KEYS, ShortcutRaw } from "./state";

export type ShortcutDef<C extends string> = { keys: KeyCode[], command: C };

export function contextual<C extends string>(context: string, shortcuts: ShortcutDef<C>[]): ShortcutRaw<C>[] {
  return shortcuts.map(s => ({ context, ...s }));
}

export function global<C extends string>(shortcuts: ShortcutDef<C>[]): ShortcutRaw<C>[] {
  return shortcuts;
}

const GLOBAL_NAVIGATION_SHORTCUTS = [
  ...global<CommandName>([
    { command: "globalNavigationFocus", keys: [KeyCode.Control, KeyCode.Digit1] }
  ]),
  ...contextual<CommandName>("globalNavigation", [
    { command: "globalNavigationCollapseAll", keys: [KeyCode.Control, KeyCode.Shift, KeyCode.ArrowUp] },
    { command: "globalNavigationExpandAll", keys: [KeyCode.Control, KeyCode.Shift, KeyCode.ArrowDown] },
    { command: "globalNavigationCreateTag", keys: [KeyCode.Control, KeyCode.LetterT] },
    { command: "globalNavigationCreateNotebook", keys: [KeyCode.Control, KeyCode.LetterN] },
    { command: "globalNavigationMoveSelectionDown", keys: GENERAL_USE_KEYS.moveSelectionDown },
    { command: "globalNavigationMoveSelectionUp", keys: GENERAL_USE_KEYS.moveSelectionUp },
    { command: "globalNavigationScrollDown", keys: GENERAL_USE_KEYS.scrollDown },
    { command: "globalNavigationScrollUp", keys: GENERAL_USE_KEYS.scrollUp }
  ])
];

const CONSOLE_SHORTCUTS = [
  ...global<CommandName>([
    { command: "consoleToggle", keys: [KeyCode.Control, KeyCode.LetterP] }
  ]),
  ...contextual<CommandName>("console", [
    { command: "consoleHide", keys: [KeyCode.Escape] }
  ])
];

export const DEFAULT_SHORTCUTS = [
  ...GLOBAL_NAVIGATION_SHORTCUTS,
  ...CONSOLE_SHORTCUTS
]
;
