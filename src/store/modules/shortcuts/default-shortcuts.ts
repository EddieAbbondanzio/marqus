/* eslint-disable max-len */
import { KeyCode } from "./key-code";
import { GENERAL_USE_KEYS, Shortcut } from "./state";

const GLOBAL_NAVIGATION_SHORTCUTS: Shortcut[] = [
  { global: true, command: "globalNavigation.focus", keys: [KeyCode.Control, KeyCode.Digit1] },
  { context: "globalNavigation", command: "globalNavigation.collapseAll", keys: [KeyCode.Control, KeyCode.Shift, KeyCode.ArrowUp] },
  { context: "globalNavigation", command: "globalNavigation.expandAll", keys: [KeyCode.Control, KeyCode.Shift, KeyCode.ArrowDown] },
  { context: "globalNavigation", command: "globalNavigation.createTag", keys: [KeyCode.Control, KeyCode.LetterT] },
  { context: "globalNavigation", command: "globalNavigation.createNotebook", keys: [KeyCode.Control, KeyCode.LetterN] },
  { context: "globalNavigation", command: "globalNavigation.moveSelectionDown", keys: GENERAL_USE_KEYS.moveSelectionDown },
  { context: "globalNavigation", command: "globalNavigation.moveSelectionUp", keys: GENERAL_USE_KEYS.moveSelectionUp },
  { context: "globalNavigation", command: "globalNavigation.scrollDown", keys: GENERAL_USE_KEYS.scrollDown },
  { context: "globalNavigation", command: "globalNavigation.scrollUp", keys: GENERAL_USE_KEYS.scrollUp }
];

const CONSOLE_SHORTCUTS: Shortcut[] = [
  { global: true, command: "commandConsole.toggle", keys: [KeyCode.Control, KeyCode.LetterP] },
  { context: "commandConsole", command: "commandConsole.hide", keys: [KeyCode.Escape] }
];

export const DEFAULT_SHORTCUTS: Shortcut[] = [
  ...GLOBAL_NAVIGATION_SHORTCUTS,
  ...CONSOLE_SHORTCUTS
];
