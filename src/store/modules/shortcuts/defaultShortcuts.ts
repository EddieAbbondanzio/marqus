/* eslint-disable max-len */
import { KeyCode } from "./keyCode";
import { GENERAL_USE_KEYS, Shortcut } from "./state";

// prettier-ignore
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

// prettier-ignore
const COMMAND_CONSOLE_SHORTCUTS: Shortcut[] = [
  { global: true, command: "commandConsole.toggle", keys: [KeyCode.Control, KeyCode.LetterP] },
  { context: "commandConsole", command: "commandConsole.hide", keys: [KeyCode.Escape] },
  { context: "commandConsole", command: "commandConsole.moveSelectionDown", keys: GENERAL_USE_KEYS.moveSelectionDown },
  { context: "commandConsole", command: "commandConsole.moveSelectionUp", keys: GENERAL_USE_KEYS.moveSelectionUp },
  { context: "commandConsole", command: "commandConsole.select", keys: GENERAL_USE_KEYS.tab },
  { context: "commandConsole", command: "commandConsole.selectAndRun", keys: GENERAL_USE_KEYS.enter }
];

// prettier-ignore
export const DEFAULT_SHORTCUTS: Shortcut[] = [
  ...GLOBAL_NAVIGATION_SHORTCUTS,
  ...COMMAND_CONSOLE_SHORTCUTS
];
