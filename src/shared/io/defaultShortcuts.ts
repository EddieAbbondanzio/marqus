import { Shortcut } from "../domain/shortcut";
import { KeyCode, sortKeyCodes } from "./keyCode";

export const COMMON_KEY_COMBOS = {
  scrollDown: [KeyCode.Control, KeyCode.ArrowDown],
  scrollUp: [KeyCode.Control, KeyCode.ArrowUp],
};

const shortcuts: Shortcut[] = [
  // Global
  {
    event: "app.quit",
    keys: [KeyCode.Control, KeyCode.LetterQ],
  },
  {
    event: "app.openDevTools",
    keys: [KeyCode.Control, KeyCode.Shift, KeyCode.LetterI],
  },
  {
    event: "app.reload",
    keys: [KeyCode.Control, KeyCode.LetterR],
  },
  {
    event: "app.toggleFullScreen",
    keys: [KeyCode.F11],
  },

  // Sidebar
  {
    event: "focus.push",
    eventInput: "sidebar",
    keys: [KeyCode.Control, KeyCode.Digit1],
  },
  {
    event: "app.toggleSidebar",
    keys: [KeyCode.Control, KeyCode.LetterB],
  },
  {
    event: "focus.push",
    eventInput: "sidebarSearch",
    keys: [KeyCode.Control, KeyCode.Shift, KeyCode.LetterF],
  },
  {
    event: "sidebar.scrollDown",
    keys: COMMON_KEY_COMBOS.scrollDown,
    when: "sidebar",
    repeat: true,
  },
  {
    event: "sidebar.scrollUp",
    keys: COMMON_KEY_COMBOS.scrollUp,
    when: "sidebar",
    repeat: true,
  },
  {
    event: "sidebar.moveSelectionUp",
    keys: [KeyCode.ArrowUp],
    when: "sidebar",
    repeat: true,
  },
  {
    event: "sidebar.moveSelectionDown",
    keys: [KeyCode.ArrowDown],
    when: "sidebar",
    repeat: true,
  },
  {
    event: "sidebar.clearSelection",
    keys: [KeyCode.Escape],
    when: "sidebar",
  },
  {
    event: "sidebar.toggleItemExpanded",
    keys: [KeyCode.Space],
    when: "sidebar",
  },

  // Editor
  {
    event: "focus.push",
    eventInput: "editor",
    keys: [KeyCode.Control, KeyCode.Digit2],
  },
  {
    event: "editor.save",
    keys: [KeyCode.Control, KeyCode.LetterS],
  },
  { event: "editor.toggleView", keys: [KeyCode.Control, KeyCode.LetterE] },
];

export const DEFAULT_SHORTCUTS = shortcuts.map((s) => ({
  ...s,
  // Ensure keys are always in correct order
  keys: sortKeyCodes(s.keys),
}));
