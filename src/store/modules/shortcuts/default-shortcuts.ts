/* eslint-disable max-len */
import { KeyCode } from "./key-code";
import { GENERAL_USE_KEYS, Shortcut } from "./state";

const GLOBAL_NAVIGATION_SHORTCUTS: Shortcut[] = [
  { global: true, command: "globalNavigationFocus", keys: [KeyCode.Control, KeyCode.Digit1] },
  { context: "globalNavigation", command: "globalNavigationCollapseAll", keys: [KeyCode.Control, KeyCode.Shift, KeyCode.ArrowUp] },
  { context: "globalNavigation", command: "globalNavigationExpandAll", keys: [KeyCode.Control, KeyCode.Shift, KeyCode.ArrowDown] },
  { context: "globalNavigation", command: "globalNavigationCreateTag", keys: [KeyCode.Control, KeyCode.LetterT] },
  { context: "globalNavigation", command: "globalNavigationCreateNotebook", keys: [KeyCode.Control, KeyCode.LetterN] },
  { context: "globalNavigation", command: "globalNavigationMoveSelectionDown", keys: GENERAL_USE_KEYS.moveSelectionDown },
  { context: "globalNavigation", command: "globalNavigationMoveSelectionUp", keys: GENERAL_USE_KEYS.moveSelectionUp },
  { context: "globalNavigation", command: "globalNavigationScrollDown", keys: GENERAL_USE_KEYS.scrollDown },
  { context: "globalNavigation", command: "globalNavigationScrollUp", keys: GENERAL_USE_KEYS.scrollUp }
];

const CONSOLE_SHORTCUTS: Shortcut[] = [
  { global: true, command: "consoleToggle", keys: [KeyCode.Control, KeyCode.LetterP] },
  { context: "commandConsole", command: "consoleHide", keys: [KeyCode.Escape] }
];

export const DEFAULT_SHORTCUTS: Shortcut[] = [
  ...GLOBAL_NAVIGATION_SHORTCUTS,
  ...CONSOLE_SHORTCUTS
];
