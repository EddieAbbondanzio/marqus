import { KeyCode } from "@/utils/shortcuts/key-code";
import { ShortcutDefinition } from "./shortcuts";

const GERNERAL_USE: ShortcutDefinition[] = [
  { keys: KeyCode.Space, command: "toggleSelection" },
  { keys: KeyCode.Space, command: "toggleSelection" },
  { keys: KeyCode.ArrowDown, command: "moveDown" },
  { keys: [KeyCode.Control, KeyCode.ArrowUp], command: "scrollUp" },
  { keys: [KeyCode.Control, KeyCode.ArrowDown], command: "scrollDown" },
  { keys: [KeyCode.Control, KeyCode.LetterZ], command: "undo" },
  { keys: [KeyCode.Control, KeyCode.LetterY], command: "redo" },
  { keys: KeyCode.F2, command: "rename" }
];

const GLOBAL_NAVIGATION: ShortcutDefinition[] = [
  { keys: [KeyCode.Control, KeyCode.Digit1], command: "focusGlobalNavigation" },
  { keys: [KeyCode.Control, KeyCode.LetterN], command: "globalNavigationCreateNotebook" },
  { keys: [KeyCode.Control, KeyCode.LetterT], command: "globalNavigationCreateTag" },
  { keys: [KeyCode.Control, KeyCode.Shift, KeyCode.ArrowUp], command: "globalNavigationCollapseAll" },
  { keys: [KeyCode.Control, KeyCode.Shift, KeyCode.ArrowDown], command: "globalNavigationExpandAll" },
  { keys: KeyCode.ArrowUp, command: "globalNavigationMoveSelectionUp" },
  { keys: KeyCode.ArrowDown, command: "globalNavigationMoveSelectionDown" },
  { keys: [KeyCode.Control, KeyCode.ArrowUp], command: "globalNavigationScrollUp" },
  { keys: [KeyCode.Control, KeyCode.ArrowDown], command: "globalNavigationScrollDown" }

];

const LOCAL_NAVIGATION: ShortcutDefinition[] = [
  { keys: [KeyCode.Control, KeyCode.Digit2], command: "focusLocalNavigation" }
];

const EDITOR: ShortcutDefinition[] = [
  { keys: [KeyCode.Control, KeyCode.Digit3], command: "focusEditor" },
  { keys: [KeyCode.Control, KeyCode.LetterS], command: "editorSave" },
  { keys: [KeyCode.Control, KeyCode.LetterE], command: "editorToggleMode" },
  { keys: [KeyCode.Control, KeyCode.Alt, KeyCode.LetterS], command: "editorToggleSplitView" }
];

export const DEFAULT_SHORTCUTS: ShortcutDefinition[] = [
  ...GERNERAL_USE,
  ...GLOBAL_NAVIGATION,
  ...LOCAL_NAVIGATION,
  ...EDITOR
];
