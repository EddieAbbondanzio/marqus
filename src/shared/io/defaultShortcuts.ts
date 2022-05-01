import { Shortcut } from "../domain/shortcut";
import { KeyCode, sortKeyCodes } from "./keyCode";

export const COMMON_KEY_COMBOS = {
  scrollDown: [KeyCode.Control, KeyCode.ArrowDown],
  scrollUp: [KeyCode.Control, KeyCode.ArrowUp],
};

const shortcuts: Shortcut[] = [
  // Global
  {
    name: "app.quit",
    event: "app.quit",
    keys: [KeyCode.Control, KeyCode.LetterQ],
  },
  {
    name: "app.openDevTools",
    event: "app.openDevTools",
    keys: [KeyCode.Control, KeyCode.Shift, KeyCode.LetterI],
  },
  {
    name: "app.relaod",
    event: "app.reload",
    keys: [KeyCode.Control, KeyCode.LetterR],
  },
  {
    name: "app.toggleFullScreen",
    event: "app.toggleFullScreen",
    keys: [KeyCode.F11],
  },

  // Sidebar
  {
    name: "sidebar.focus",
    event: "focus.push",
    eventInput: "sidebar",
    keys: [KeyCode.Control, KeyCode.Digit1],
  },
  {
    name: "app.toggleSidebar",
    event: "app.toggleSidebar",
    keys: [KeyCode.Control, KeyCode.LetterB],
  },
  {
    name: "sidebar.focusSearch",
    event: "focus.push",
    eventInput: "sidebarSearch",
    keys: [KeyCode.Control, KeyCode.Shift, KeyCode.LetterF],
  },
  {
    name: "sidebar.scrollDown",
    event: "sidebar.scrollDown",
    keys: COMMON_KEY_COMBOS.scrollDown,
    when: "sidebar",
    repeat: true,
  },
  {
    name: "sidebar.scrollUp",
    event: "sidebar.scrollUp",
    keys: COMMON_KEY_COMBOS.scrollUp,
    when: "sidebar",
    repeat: true,
  },
  {
    name: "sidebar.moveSelectionUp",
    event: "sidebar.moveSelectionUp",
    keys: [KeyCode.ArrowUp],
    when: "sidebar",
    repeat: true,
  },
  {
    name: "sidebar.moveSelectionDown",
    event: "sidebar.moveSelectionDown",
    keys: [KeyCode.ArrowDown],
    when: "sidebar",
    repeat: true,
  },
  {
    name: "sidebar.clearSelection",
    event: "sidebar.clearSelection",
    keys: [KeyCode.Escape],
    when: "sidebar",
  },
  {
    name: "sidebar.toggleItemExpanded",
    event: "sidebar.toggleItemExpanded",
    keys: [KeyCode.Space],
    when: "sidebar",
  },

  // Editor
  {
    name: "editor.focus",
    event: "focus.push",
    eventInput: "editor",
    keys: [KeyCode.Control, KeyCode.Digit2],
  },
  {
    name: "editor.save",
    event: "editor.save",
    keys: [KeyCode.Control, KeyCode.LetterS],
  },
  {
    name: "Editor.toggleView",
    event: "editor.toggleView",
    keys: [KeyCode.Control, KeyCode.LetterE],
  },
];

export const DEFAULT_SHORTCUTS = shortcuts.map((s) => ({
  ...s,
  // Ensure keys are always in correct order
  keys: sortKeyCodes(s.keys),
}));
